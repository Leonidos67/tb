import { Router, Request, Response } from "express";
import fetch from "node-fetch";
import { config } from "../config/app.config";
import isAuthenticated from "../middlewares/isAuthenticated.middleware";
import TaskModel from "../models/task.model";
import ProjectModel from "../models/project.model";
import MemberModel from "../models/member.model";
import WorkspaceModel from "../models/workspace.model";
import { TaskStatusEnum } from "../enums/task.enum";
import mongoose from "mongoose";

const aiRoutes = Router();

aiRoutes.post("/query", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const promptRaw = (req.body && (req.body as any).prompt) as unknown;
    const prompt = typeof promptRaw === "string" ? promptRaw : "";

         const userId = req.user?._id?.toString();
     let workspaceId = req.user?.currentWorkspace?.toString();
     let userMemberships: any[] = [];

     // Если нет текущей зоны или нужно определить актуальную зону
     if (!workspaceId && userId) {
       // Получаем все зоны пользователя и выбираем самую активную (с последними задачами)
       userMemberships = await MemberModel.find({ userId })
         .populate({ path: "workspaceId", select: "name" })
         .sort({ joinedAt: -1 })
         .lean();
       
       if (userMemberships && userMemberships.length > 0) {
         // Если у пользователя только одна зона, используем её
         if (userMemberships.length === 1) {
           workspaceId = userMemberships[0].workspaceId.toString();
         } else {
           // Если несколько зон, выбираем ту, где есть активные задачи
           for (const membership of userMemberships) {
             const workspaceIdStr = membership.workspaceId.toString();
             const activeTasksCount = await TaskModel.countDocuments({
               workspace: workspaceIdStr,
               assignedTo: userId,
               isHidden: { $ne: true },
               status: { $ne: TaskStatusEnum.DONE }
             });
             
             if (activeTasksCount > 0) {
               workspaceId = workspaceIdStr;
               break;
             }
           }
           
           // Если не нашли зону с активными задачами, берем первую
           if (!workspaceId) {
             workspaceId = userMemberships[0].workspaceId.toString();
           }
         }
       }
     }

         let context = "";
     let summaryLines: string[] = [];
     const entityLinks: string[] = [];
     let activeCount = 0;
     let completedCount = 0;
     let projectsWithUserTasks: { _id: string; name: string; emoji?: string | null }[] = [];
     let members: { name?: string; userRole?: string | null }[] = [];
     let projects: any[] = [];
     if (workspaceId) {
      // Получаем все зоны пользователя для отображения доступных зон
      if (userId) {
        userMemberships = await MemberModel.find({ userId })
          .populate({ path: "workspaceId", select: "name" })
          .sort({ joinedAt: -1 })
          .lean();
      }
      
      const now = new Date();
             const [workspace, overdue, recent, totals, activeCnt, completedCnt] = await Promise.all([
         WorkspaceModel.findById(workspaceId).select("name").lean(),
         TaskModel.find({
           workspace: workspaceId,
           isHidden: { $ne: true },
           dueDate: { $lt: now },
           status: { $ne: TaskStatusEnum.DONE },
         })
           .sort({ dueDate: 1 })
           .limit(5)
           .select("title status priority dueDate")
           .lean(),
         TaskModel.find({ workspace: workspaceId, isHidden: { $ne: true } })
           .sort({ updatedAt: -1 })
           .limit(5)
           .select("title status priority dueDate")
           .lean(),
         TaskModel.aggregate([
           { $match: { workspace: new mongoose.Types.ObjectId(workspaceId), isHidden: { $ne: true } } },
           {
             $group: {
               _id: "$status",
               count: { $sum: 1 },
             },
           },
         ]),
         TaskModel.countDocuments({ workspace: workspaceId, isHidden: { $ne: true }, status: { $ne: TaskStatusEnum.DONE } }),
         TaskModel.countDocuments({ workspace: workspaceId, isHidden: { $ne: true }, status: TaskStatusEnum.DONE }),
       ]);
       
       // Получаем все проекты как в сайдбаре
       const allProjects = await ProjectModel.find({ workspace: workspaceId })
         .sort({ createdAt: -1 })
         .select("_id name emoji description")
         .lean();
       projects = allProjects;
      activeCount = activeCnt;
      completedCount = completedCnt;

      const memberDocs = await MemberModel.find({ workspaceId })
        .populate({ path: "userId", select: "name userRole" })
        .lean();
      members = (memberDocs || []).map((m: any) => ({
        name: m?.userId?.name,
        userRole: m?.userId?.userRole ?? null,
      }));

             if (userId) {
         const assignedProjectIds = await TaskModel.find({ workspace: workspaceId, assignedTo: userId })
           .distinct("project");
         if (assignedProjectIds && assignedProjectIds.length) {
           const assignedProjects = await ProjectModel.find({ _id: { $in: assignedProjectIds as any } })
             .select("_id name emoji")
             .lean();
           projectsWithUserTasks = assignedProjects.map(p => ({ _id: String(p._id), name: p.name, emoji: p.emoji }));
         }
       }

      const totalsMap = new Map<string, number>();
      for (const t of totals as any[]) {
        totalsMap.set(t._id, t.count);
      }

             summaryLines.push(`Текущая рабочая зона: ${workspace?.name || workspaceId}`);
       if (userMemberships && userMemberships.length > 1) {
         summaryLines.push(`Доступные зоны: ${userMemberships.map(m => (m.workspaceId as any)?.name).filter(Boolean).join(", ")}`);
       }
      summaryLines.push(`Актуальные тренировки: ${activeCount}`);
      summaryLines.push(`Выполненные тренировки: ${completedCount}`);
      summaryLines.push(
        `Комнат (проектов): ${projects.length ? projects.length : 0}` +
          (projects.length ? ` — ${projects.map(p => `${p.emoji || ''} ${p.name}`).join(", ")}` : "")
      );
      if (projectsWithUserTasks.length) {
        summaryLines.push(
          `Общие комнаты со спортсменом: ${projectsWithUserTasks.map(p => `${p.emoji || ''} ${p.name}`).join(", ")}`
        );
      }
      if (members.length) {
        const sample = members.slice(0, 5).map(m => `${m.name || '—'}${m.userRole ? ` (${m.userRole})` : ''}`).join(", ");
        summaryLines.push(`Участники зоны: ${members.length}${sample ? ` — ${sample}` : ''}`);
      }
      summaryLines.push(
        `Статусы: ` +
          [
            `TODO: ${totalsMap.get(TaskStatusEnum.TODO) || 0}`,
            `IN_PROGRESS: ${totalsMap.get(TaskStatusEnum.IN_PROGRESS) || 0}`,
            `IN_REVIEW: ${totalsMap.get(TaskStatusEnum.IN_REVIEW) || 0}`,
            `DONE: ${totalsMap.get(TaskStatusEnum.DONE) || 0}`,
          ].join(" | ")
      );

      context = `Workspace summary\n` +
        `Projects: ${projects.map(p => `${p.emoji || ''} ${p.name}`).join('; ')}\n` +
        `Recent tasks: ${recent.map(t => `${t.title} [${t.status}|${t.priority}]`).join('; ')}\n` +
        `Active count: ${activeCount}; Completed count: ${completedCount}\n` +
        (projectsWithUserTasks.length ? `Shared rooms: ${projectsWithUserTasks.map(p => `${p.emoji || ''} ${p.name}`).join('; ')}` : ``) +
        (members.length ? `\nMembers: ${members.slice(0, 10).map(m => `${m.name || '—'}${m.userRole ? `(${m.userRole})` : ''}`).join('; ')}` : ``);
    }

         const lowerPrompt = (prompt || "").toLowerCase();
     const asksWho = lowerPrompt.includes("кто ты") || lowerPrompt.includes("кто тебя разработал") || lowerPrompt.includes("кем ты был разработан") || lowerPrompt.includes("кто разработал") || lowerPrompt.includes("who are you") || lowerPrompt.includes("who developed") || lowerPrompt.includes("who built you");
     const introduceLine = asksWho ? "Меня разработала команда T-Sync." : "";

     // Проверяем, не указал ли пользователь конкретную зону в запросе
     const workspaceMatch = (prompt || '').match(/зона[:\s]+([^\s]+)/i) || (prompt || '').match(/workspace[:\s]+([^\s]+)/i);
     if (workspaceMatch && userId) {
       const workspaceName = workspaceMatch[1].toLowerCase();
       const tempUserMemberships = await MemberModel.find({ userId })
         .populate({ path: "workspaceId", select: "name" })
         .lean();
       
               const targetWorkspace = tempUserMemberships.find(m => {
          const workspace = m.workspaceId as any;
          return workspace?.name?.toLowerCase().includes(workspaceName);
        });
       
       if (targetWorkspace) {
         workspaceId = targetWorkspace.workspaceId.toString();
       }
     }

    // Try to detect references to a specific room (project) or training (task) and add direct links
    if (workspaceId) {
      try {
        const allProjects = await ProjectModel.find({ workspace: workspaceId })
          .select("_id name emoji")
          .limit(50)
          .lean();
        const matchedProject = allProjects.find((p: any) => {
          const nameHit = p?.name && lowerPrompt.includes(String(p.name).toLowerCase());
          const emojiHit = p?.emoji && lowerPrompt.includes(String(p.emoji).toLowerCase());
          return Boolean(nameHit || emojiHit);
        });
        if (matchedProject) {
          entityLinks.push(`/workspace/${workspaceId}/project/${matchedProject._id}`);
        }

        const codeMatch = (prompt || '').match(/task-[a-z0-9]{3,}/i);
        if (codeMatch) {
          const taskByCode = await TaskModel.findOne({ workspace: workspaceId, taskCode: codeMatch[0] })
            .select("_id project")
            .lean();
          if (taskByCode?.project) {
            entityLinks.push(`/workspace/${workspaceId}/project/${String(taskByCode.project)}`);
          }
        }
      } catch {
        // ignore link detection errors
      }
    }

    const systemInstruction = `Ты — ассистент навигации по приложению тренера/спортсмена женского пола. Отвечай кратко и по делу на русском.
Если пользователь спрашивает кто ты/кто разработал — обязательно ответь: \'Я — ассистент T-Sync.\'.
Можешь подсказывать маршруты (например /workspace/:id/tasks), но не добавляй query-параметры (например ?project=).
Если спрашивают про конкретную комнату (проект) или тренировку, добавь прямую ссылку на комнату: /workspace/:workspaceId/project/:projectId.
Избегай навязчивых рекомендаций вроде \'Рекомендую проверить просроченные тренировки\'. Если нет данных, скажи, что данных нет.`;

    const finalPrompt = `${systemInstruction}\n\nКонтекст:\n${context}\n\nВопрос пользователя: ${prompt}`;

    // Детеминированные ответы для ключевых сценариев до вызова Gemini,
    // чтобы список комнат всегда показывался полностью и предсказуемо
    if (workspaceId) {
      const lower = lowerPrompt;
      const askAllRooms = lower.includes("все");
      const askMyRooms = lower.includes("мои") || lower.includes("мой");

      if (lower.includes("комнат") || lower.includes("проект")) {
        let answer = "";
        if (projects && projects.length > 0) {
          // Краткое сообщение о количестве комнат
          answer = `В вашей зоне я нашел ${projects.length} комнат(у). Выберите комнату(ы), чтобы ознакомиться с тренировками.`;
          
          // Возвращаем комнаты для отображения кнопок
          const rooms = projects.map((p: any) => ({
            _id: String(p._id),
            name: p.name,
            emoji: p.emoji,
          }));
          
          res.status(200).json({ answer, rooms });
          return;
        } else {
          answer = "У вас пока нет комнат. Создайте первую комнату для организации тренировок.";
        }
        if (entityLinks.length > 0) {
          answer += `\n\nПрямые ссылки: ${entityLinks.join(" | ")}`;
        }
        res.status(200).json({ answer });
        return;
      }

      if (lower.includes("участник") || lower.includes("спортсмен")) {
        let answer = "";
        if (members && members.length > 0) {
          const memberList = members
            .map(m => `• ${m.name || '—'}${m.userRole ? ` (${m.userRole})` : ''}`)
            .join('\n');
          answer = `Участники вашей зоны (${members.length}):\n${memberList}\n\nСсылка: /workspace/${workspaceId}/members`;
        } else {
          answer = "В вашей зоне пока нет участников.";
        }
        res.status(200).json({ answer });
        return;
      }

      if (lower.includes("тренировк") || lower.includes("задач")) {
        // 1) Явный выбор комнаты через токен roomId:<id>
        const roomIdMatch = (prompt || '').match(/roomId[:\s]+([a-f0-9]{24})/i) || (prompt || '').match(/projectId[:\s]+([a-f0-9]{24})/i);
        if (roomIdMatch) {
          const selectedProjectId = roomIdMatch[1];
          const selectedProject = projects.find((p: any) => String(p._id) === String(selectedProjectId));
          if (selectedProject) {
            const projectTasks = await TaskModel.find({
              workspace: workspaceId,
              project: selectedProject._id,
              isHidden: { $ne: true },
            }).lean();

            const activeTasks = projectTasks.filter((t: any) => t.status !== TaskStatusEnum.DONE);
            const completedTasks = projectTasks.filter((t: any) => t.status === TaskStatusEnum.DONE);
            const overdueTasks = projectTasks.filter((t: any) =>
              t.dueDate && new Date(t.dueDate) < new Date() && t.status !== TaskStatusEnum.DONE
            );

            const tasksList = projectTasks
              .map((t: any) => `• ${t.title} [${t.status}${t.priority ? `|${t.priority}` : ''}]${t.dueDate ? ` — до ${new Date(t.dueDate).toLocaleDateString()}` : ''}`)
              .join('\n');

            const answer = `Тренировки в комнате ${selectedProject.emoji || ''} ${selectedProject.name}:\n\n` +
              `• Актуальные: ${activeTasks.length}\n` +
              `• Просроченные: ${overdueTasks.length}\n` +
              `• Выполненные: ${completedTasks.length}\n` +
              `• Всего: ${projectTasks.length}\n\n` +
              (tasksList ? `${tasksList}\n\n` : '') +
              `Ссылка: /workspace/${workspaceId}/project/${String(selectedProject._id)}`;
            res.status(200).json({ answer });
            return;
          }
        }

        // 2) По запросу "Покажи тренировки в комнате [эмодзи] [название]"
        const roomQueryMatch = (prompt || '').match(/покажи тренировки в комнате\s+([^\s]+)\s+([^\n]+)/i);
        if (roomQueryMatch) {
          const emoji = roomQueryMatch[1];
          const roomName = roomQueryMatch[2].trim();
          
          // Ищем комнату по эмодзи и названию
          const matchedProject = projects.find((p: any) => {
            const emojiMatch = p?.emoji && String(p.emoji).includes(emoji);
            const nameMatch = p?.name && String(p.name).toLowerCase().includes(roomName.toLowerCase());
            return Boolean(emojiMatch && nameMatch);
          });
          
          if (matchedProject) {
            const projectTasks = await TaskModel.find({
              workspace: workspaceId,
              project: matchedProject._id,
              isHidden: { $ne: true },
            }).lean();

            const activeTasks = projectTasks.filter((t: any) => t.status !== TaskStatusEnum.DONE);
            const completedTasks = projectTasks.filter((t: any) => t.status === TaskStatusEnum.DONE);
            const overdueTasks = projectTasks.filter((t: any) =>
              t.dueDate && new Date(t.dueDate) < new Date() && t.status !== TaskStatusEnum.DONE
            );

            const tasksList = projectTasks
              .map((t: any) => `• ${t.title} [${t.status}${t.priority ? `|${t.priority}` : ''}]${t.dueDate ? ` — до ${new Date(t.dueDate).toLocaleDateString()}` : ''}`)
              .join('\n');

            const answer = `Тренировки в комнате ${matchedProject.emoji || ''} ${matchedProject.name}:\n\n` +
              `• Актуальные: ${activeTasks.length}\n` +
              `• Просроченные: ${overdueTasks.length}\n` +
              `• Выполненные: ${completedTasks.length}\n` +
              `• Всего: ${projectTasks.length}\n\n` +
              (tasksList ? `${tasksList}\n\n` : '') +
              `Ссылка: /workspace/${workspaceId}/project/${String(matchedProject._id)}`;
            res.status(200).json({ answer });
            return;
          }
        }

        // 3) По названию/эмодзи
        const matchedProject = projects.find((p: any) => {
          const nameHit = p?.name && lower.includes(String(p.name).toLowerCase());
          const emojiHit = p?.emoji && lower.includes(String(p.emoji).toLowerCase());
          return Boolean(nameHit || emojiHit);
        });
        let trainingAnswer = "";
        if (matchedProject) {
          const projectTasks = await TaskModel.find({
            workspace: workspaceId,
            project: matchedProject._id,
            isHidden: { $ne: true },
          }).lean();

          const activeTasks = projectTasks.filter((t: any) => t.status !== TaskStatusEnum.DONE);
          const completedTasks = projectTasks.filter((t: any) => t.status === TaskStatusEnum.DONE);
          const overdueTasks = projectTasks.filter((t: any) =>
            t.dueDate && new Date(t.dueDate) < new Date() && t.status !== TaskStatusEnum.DONE
          );

          const tasksList = projectTasks
            .map((t: any) => `• ${t.title} [${t.status}${t.priority ? `|${t.priority}` : ''}]${t.dueDate ? ` — до ${new Date(t.dueDate).toLocaleDateString()}` : ''}`)
            .join('\n');

          trainingAnswer = `Тренировки в комнате ${matchedProject.emoji || ''} ${matchedProject.name}:\n\n` +
            `• Актуальные: ${activeTasks.length}\n` +
            `• Просроченные: ${overdueTasks.length}\n` +
            `• Выполненные: ${completedTasks.length}\n` +
            `• Всего: ${projectTasks.length}\n\n` +
            (tasksList ? `${tasksList}\n\n` : '') +
            `Ссылка: /workspace/${workspaceId}/project/${String(matchedProject._id)}`;
        } else if (projects && projects.length > 0) {
          // Вернем комнаты для выбора в структурированном виде
          const rooms = projects.map((p: any) => ({
            _id: String(p._id),
            name: p.name,
            emoji: p.emoji,
          }));
          trainingAnswer = `Выберите комнату, чтобы посмотреть тренировки`;
          res.status(200).json({ answer: trainingAnswer, rooms });
          return;
        } else {
          trainingAnswer = "У вас пока нет комнат с тренировками. Создайте первую комнату для организации тренировок.";
        }
        res.status(200).json({ answer: trainingAnswer });
        return;
      }

      // Обработка запроса о выполненных тренировках
      if (lower.includes("выполнен") || lower.includes("завершен")) {
        if (projects && projects.length > 0) {
          // Вернем комнаты для выбора + опцию "Показать все тренировки зоны"
          const rooms = projects.map((p: any) => ({
            _id: String(p._id),
            name: p.name,
            emoji: p.emoji,
          }));
          
          // Добавляем специальную опцию для всех тренировок зоны
          const allZoneOption = {
            _id: "all-zone",
            name: "Показать все тренировки зоны",
            emoji: "🏆",
            isSpecial: true
          };
          
          const trainingAnswer = `Выберите комнату в которой хотите посмотреть выполненные тренировки:`;
          res.status(200).json({ 
            answer: trainingAnswer, 
            rooms: [allZoneOption, ...rooms] 
          });
          return;
        } else {
          const trainingAnswer = "У вас пока нет комнат с тренировками. Создайте первую комнату для организации тренировок.";
          res.status(200).json({ answer: trainingAnswer });
          return;
        }
      }

      // Обработка запроса "Покажи все тренировки зоны"
      if (lower.includes("все тренировки зоны")) {
        if (projects && projects.length > 0) {
          // Получаем все тренировки из всех комнат
          const allTasks = await TaskModel.find({
            workspace: workspaceId,
            isHidden: { $ne: true },
          }).lean();

          const activeTasks = allTasks.filter((t: any) => t.status !== TaskStatusEnum.DONE);
          const completedTasks = allTasks.filter((t: any) => t.status === TaskStatusEnum.DONE);
          const overdueTasks = allTasks.filter((t: any) =>
            t.dueDate && new Date(t.dueDate) < new Date() && t.status !== TaskStatusEnum.DONE
          );

          // Группируем задачи по комнатам
          const tasksByProject = new Map();
          for (const task of allTasks) {
            const projectId = String(task.project);
            const project = projects.find((p: any) => String(p._id) === projectId);
            if (project) {
              if (!tasksByProject.has(projectId)) {
                tasksByProject.set(projectId, {
                  project: project,
                  tasks: []
                });
              }
              tasksByProject.get(projectId).tasks.push(task);
            }
          }

          let allZoneAnswer = `Все тренировки зоны:\n\n` +
            `• Актуальные: ${activeTasks.length}\n` +
            `• Просроченные: ${overdueTasks.length}\n` +
            `• Выполненные: ${completedTasks.length}\n` +
            `• Всего: ${allTasks.length}\n\n`;

          // Показываем задачи по комнатам
          for (const [projectId, data] of tasksByProject) {
            const project = data.project;
            const projectTasks = data.tasks;
            allZoneAnswer += `${project.emoji || ''} ${project.name} (${projectTasks.length}):\n`;
            projectTasks.forEach((task: any) => {
              allZoneAnswer += `  • ${task.title} [${task.status}${task.priority ? `|${task.priority}` : ''}]${task.dueDate ? ` — до ${new Date(task.dueDate).toLocaleDateString()}` : ''}\n`;
            });
            allZoneAnswer += '\n';
          }

          res.status(200).json({ answer: allZoneAnswer });
          return;
        } else {
          const allZoneAnswer = "У вас пока нет комнат с тренировками. Создайте первую комнату для организации тренировок.";
          res.status(200).json({ answer: allZoneAnswer });
          return;
        }
      }
    }

         if (!config.GEMINI_API_KEY) {
      // Без ключа: умные ответы на основе контекста
      const lower = (prompt || "").toLowerCase();
      let fallbackAnswer = "";
      const askAllRooms = lower.includes("все");
      const askMyRooms = lower.includes("мои") || lower.includes("мой");
      
      // Конкретные ответы на основе вопроса
                 if (lower.includes("комнат") || lower.includes("проект")) {
            if (projects && projects.length > 0) {
              fallbackAnswer = `В вашей зоне ${projects.length} комнат`;
              if (askMyRooms && projectsWithUserTasks && projectsWithUserTasks.length > 0) {
                fallbackAnswer += `\n\nУ вас ${projectsWithUserTasks.length} комнат с вашими тренировками`;
              }
              
              // Возвращаем комнаты для отображения кнопок
              const rooms = projects.map((p: any) => ({
                _id: String(p._id),
                name: p.name,
                emoji: p.emoji,
              }));
              
              res.status(200).json({ answer: fallbackAnswer, rooms });
              return;
            } else {
              fallbackAnswer = "У вас пока нет комнат. Создайте первую комнату для организации тренировок.";
            }
        } else if (lower.includes("участник") || lower.includes("спортсмен")) {
         if (members && members.length > 0) {
           const memberList = members.map(m => `• ${m.name || '—'}${m.userRole ? ` (${m.userRole})` : ''}`).join('\n');
           fallbackAnswer = `Участники вашей зоны (${members.length}):\n${memberList}\n\nСсылка: /workspace/${workspaceId}/members`;
         } else {
           fallbackAnswer = "В вашей зоне пока нет участников.";
         }
                } else if (lower.includes("тренировк") || lower.includes("задач")) {
            // Проверяем, спрашивает ли пользователь о конкретной комнате
            // 1) По запросу "Покажи тренировки в комнате [эмодзи] [название]"
            const roomQueryMatch = (prompt || '').match(/покажи тренировки в комнате\s+([^\s]+)\s+([^\n]+)/i);
            if (roomQueryMatch) {
              const emoji = roomQueryMatch[1];
              const roomName = roomQueryMatch[2].trim();
              
              // Ищем комнату по эмодзи и названию
              const matchedProjectByQuery = projects.find((p: any) => {
                const emojiMatch = p?.emoji && String(p.emoji).includes(emoji);
                const nameMatch = p?.name && String(p.name).toLowerCase().includes(roomName.toLowerCase());
                return Boolean(emojiMatch && nameMatch);
              });
              
              if (matchedProjectByQuery) {
                // Показываем тренировки в конкретной комнате
                const projectTasks = await TaskModel.find({ 
                  workspace: workspaceId, 
                  project: matchedProjectByQuery._id,
                  isHidden: { $ne: true }
                }).lean();
                
                const activeTasks = projectTasks.filter((t: any) => t.status !== TaskStatusEnum.DONE);
                const completedTasks = projectTasks.filter((t: any) => t.status === TaskStatusEnum.DONE);
                const overdueTasks = projectTasks.filter((t: any) => 
                  t.dueDate && new Date(t.dueDate) < new Date() && t.status !== TaskStatusEnum.DONE
                );
                
                fallbackAnswer = `Тренировки в комнате ${matchedProjectByQuery.emoji || ''} ${matchedProjectByQuery.name}:\n\n` +
                  `• Актуальные: ${activeTasks.length}\n` +
                  `• Просроченные: ${overdueTasks.length}\n` +
                  `• Выполненные: ${completedTasks.length}\n` +
                  `• Всего: ${projectTasks.length}\n\n` +
                  `Ссылка: /workspace/${workspaceId}/project/${matchedProjectByQuery._id}`;
                res.status(200).json({ answer: fallbackAnswer });
                return;
              }
            }
            
            // 2) По названию/эмодзи (общий поиск)
            const matchedProject = projects.find((p: any) => {
              const nameHit = p?.name && lower.includes(String(p.name).toLowerCase());
              const emojiHit = p?.emoji && lower.includes(String(p.emoji).toLowerCase());
              return Boolean(nameHit || emojiHit);
            });
            
            if (matchedProject) {
              // Показываем тренировки в конкретной комнате
              const projectTasks = await TaskModel.find({ 
                workspace: workspaceId, 
                project: matchedProject._id,
                isHidden: { $ne: true }
              }).lean();
              
              const activeTasks = projectTasks.filter((t: any) => t.status !== TaskStatusEnum.DONE);
              const completedTasks = projectTasks.filter((t: any) => t.status === TaskStatusEnum.DONE);
              const overdueTasks = projectTasks.filter((t: any) => 
                t.dueDate && new Date(t.dueDate) < new Date() && t.status !== TaskStatusEnum.DONE
              );
              
              fallbackAnswer = `Тренировки в комнате ${matchedProject.emoji || ''} ${matchedProject.name}:\n\n` +
                `• Актуальные: ${activeTasks.length}\n` +
                `• Просроченные: ${overdueTasks.length}\n` +
                `• Выполненные: ${completedTasks.length}\n` +
                `• Всего: ${projectTasks.length}\n\n` +
                `Ссылка: /workspace/${workspaceId}/project/${matchedProject._id}`;
            } else if (projects && projects.length > 0) {
              // Показываем список всех комнат
              const projectLinks = projects.map((p: any) => `${p.emoji || ''} ${p.name}: /workspace/${workspaceId}/project/${p._id}`).join('\n');
              fallbackAnswer = `Ваши комнаты с тренировками:\n${projectLinks}\n\nВыберите комнату, чтобы посмотреть тренировки в ней.`;
            } else {
              fallbackAnswer = "У вас пока нет комнат с тренировками. Создайте первую комнату для организации тренировок.";
            }
       } else if (lower.includes("завершен")) {
         if (projects && projects.length > 0) {
            // Вернем комнаты для выбора + опцию "Показать все тренировки зоны"
            const rooms = projects.map((p: any) => ({
              _id: String(p._id),
              name: p.name,
              emoji: p.emoji,
            }));
            
            // Добавляем специальную опцию для всех тренировок зоны
            const allZoneOption = {
              _id: "all-zone",
              name: "Показать все тренировки зоны",
              emoji: "🏆",
              isSpecial: true
            };
            
            fallbackAnswer = `Выберите комнату в которой хотите посмотреть выполненные тренировки:`;
            res.status(200).json({ 
              answer: fallbackAnswer, 
              rooms: [allZoneOption, ...rooms] 
            });
            return;
          } else {
            fallbackAnswer = `Выполненные тренировки: ${completedCount}\n\nСсылка: /workspace/${workspaceId}/completed`;
          }
        } else if (lower.includes("привет") || lower.includes("hello")) {
         fallbackAnswer = `Привет! Я помогу вам с навигацией по T-Sync. У вас ${projects?.length || 0} комнат.`;
       } else {
         // Общий ответ с кратким контекстом
         fallbackAnswer = `В вашей зоне ${projects?.length || 0} комнат и ${members?.length || 0} участников.`;
       }

       // Добавляем найденные ссылки на конкретные сущности
       if (entityLinks.length > 0) {
         fallbackAnswer += `\n\nПрямые ссылки: ${entityLinks.join(" | ")}`;
       }

       res.status(200).json({ answer: fallbackAnswer });
       return;
     }

    const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    const response = await fetch(`${geminiUrl}?key=${config.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: finalPrompt }] }],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      // If quota exceeded (429) or other API errors, fall back to local logic
             if (response.status === 429 || response.status >= 400) {
         // Use fallback logic instead of returning error
         const lower = (prompt || "").toLowerCase();
         let errorFallbackAnswer = "";
        const askAllRooms = lower.includes("все");
        const askMyRooms = lower.includes("мои") || lower.includes("мой");
        
         // Конкретные ответы на основе вопроса
         if (lower.includes("комнат") || lower.includes("проект")) {
          if (projects && projects.length > 0) {
            errorFallbackAnswer = `В вашей зоне ${projects.length} комнат`;
            if (askMyRooms && projectsWithUserTasks && projectsWithUserTasks.length > 0) {
              errorFallbackAnswer += `\n\nУ вас ${projectsWithUserTasks.length} комнат с вашими тренировками`;
            }
            
            // Возвращаем комнаты для отображения кнопок
            const rooms = projects.map((p: any) => ({
              _id: String(p._id),
              name: p.name,
              emoji: p.emoji,
            }));
            
            res.status(200).json({ answer: errorFallbackAnswer, rooms });
            return;
          } else {
            errorFallbackAnswer = "У вас пока нет комнат. Создайте первую комнату для организации тренировок.";
          }
        } else if (lower.includes("участник") || lower.includes("спортсмен")) {
         if (members && members.length > 0) {
           const memberList = members.map(m => `• ${m.name || '—'}${m.userRole ? ` (${m.userRole})` : ''}`).join('\n');
           errorFallbackAnswer = `Участники вашей зоны (${members.length}):\n${memberList}\n\nСсылка: /workspace/${workspaceId}/members`;
         } else {
           errorFallbackAnswer = "В вашей зоне пока нет участников.";
         }
         } else if (lower.includes("тренировк") || lower.includes("задач")) {
           // Проверяем, спрашивает ли пользователь о конкретной комнате
           // 1) По запросу "Покажи тренировки в комнате [эмодзи] [название]"
           const roomQueryMatch = (prompt || '').match(/покажи тренировки в комнате\s+([^\s]+)\s+([^\n]+)/i);
           if (roomQueryMatch) {
             const emoji = roomQueryMatch[1];
             const roomName = roomQueryMatch[2].trim();
             
             // Ищем комнату по эмодзи и названию
             const matchedProjectByQuery = projects.find((p: any) => {
               const emojiMatch = p?.emoji && String(p.emoji).includes(emoji);
               const nameMatch = p?.name && String(p.name).toLowerCase().includes(roomName.toLowerCase());
               return Boolean(emojiMatch && nameMatch);
             });
             
             if (matchedProjectByQuery) {
               // Показываем тренировки в конкретной комнате
               const projectTasks = await TaskModel.find({ 
                 workspace: workspaceId, 
                 project: matchedProjectByQuery._id,
                 isHidden: { $ne: true }
               }).lean();
               
               const activeTasks = projectTasks.filter((t: any) => t.status !== TaskStatusEnum.DONE);
               const completedTasks = projectTasks.filter((t: any) => t.status === TaskStatusEnum.DONE);
               const overdueTasks = projectTasks.filter((t: any) => 
                 t.dueDate && new Date(t.dueDate) < new Date() && t.status !== TaskStatusEnum.DONE
               );
               
               errorFallbackAnswer = `Тренировки в комнате ${matchedProjectByQuery.emoji || ''} ${matchedProjectByQuery.name}:\n\n` +
                 `• Актуальные: ${activeTasks.length}\n` +
                 `• Просроченные: ${overdueTasks.length}\n` +
                 `• Выполненные: ${completedTasks.length}\n` +
                 `• Всего: ${projectTasks.length}\n\n` +
                 `Ссылка: /workspace/${workspaceId}/project/${matchedProjectByQuery._id}`;
               res.status(200).json({ answer: errorFallbackAnswer });
               return;
             }
           }
           
           // 2) По названию/эмодзи (общий поиск)
           const matchedProject = projects.find((p: any) => {
             const nameHit = p?.name && lower.includes(String(p.name).toLowerCase());
             const emojiHit = p?.emoji && lower.includes(String(p.emoji).toLowerCase());
             return Boolean(nameHit || emojiHit);
           });
           
           if (matchedProject) {
             // Показываем тренировки в конкретной комнате
             const projectTasks = await TaskModel.find({ 
               workspace: workspaceId, 
               project: matchedProject._id,
               isHidden: { $ne: true }
             }).lean();
             
             const activeTasks = projectTasks.filter((t: any) => t.status !== TaskStatusEnum.DONE);
             const completedTasks = projectTasks.filter((t: any) => t.status === TaskStatusEnum.DONE);
             const overdueTasks = projectTasks.filter((t: any) => 
               t.dueDate && new Date(t.dueDate) < new Date() && t.status !== TaskStatusEnum.DONE
             );
             
             errorFallbackAnswer = `Тренировки в комнате ${matchedProject.emoji || ''} ${matchedProject.name}:\n\n` +
               `• Актуальные: ${activeTasks.length}\n` +
               `• Просроченные: ${overdueTasks.length}\n` +
               `• Выполненные: ${completedTasks.length}\n` +
               `• Всего: ${projectTasks.length}\n\n` +
               `Ссылка: /workspace/${workspaceId}/project/${matchedProject._id}`;
           } else if (projects && projects.length > 0) {
             // Показываем список всех комнат
             const projectLinks = projects.map((p: any) => `${p.emoji || ''} ${p.name}: /workspace/${workspaceId}/project/${p._id}`).join('\n');
             errorFallbackAnswer = `Ваши комнаты с тренировками:\n${projectLinks}\n\nВыберите комнату, чтобы посмотреть тренировки в ней.`;
           } else {
             errorFallbackAnswer = "У вас пока нет комнат с тренировками. Создайте первую комнату для организации тренировок.";
           }
         } else if (lower.includes("завершен")) {
           if (projects && projects.length > 0) {
              // Вернем комнаты для выбора + опцию "Показать все тренировки зоны"
              const rooms = projects.map((p: any) => ({
                _id: String(p._id),
                name: p.name,
                emoji: p.emoji,
              }));
              
              // Добавляем специальную опцию для всех тренировок зоны
              const allZoneOption = {
                _id: "all-zone",
                name: "Показать все тренировки зоны",
                emoji: "🏆",
                isSpecial: true
              };
              
              errorFallbackAnswer = `Выберите комнату в которой хотите посмотреть выполненные тренировки:`;
              res.status(200).json({ 
                answer: errorFallbackAnswer, 
                rooms: [allZoneOption, ...rooms] 
              });
              return;
            } else {
              errorFallbackAnswer = `Выполненные тренировки: ${completedCount}\n\nСсылка: /workspace/${workspaceId}/completed`;
            }
          } else if (lower.includes("привет") || lower.includes("hello")) {
            errorFallbackAnswer = `Привет! Я помогу вам с навигацией по T-Sync. У вас ${projects?.length || 0} комнат.`;
          } else {
            // Общий ответ с кратким контекстом
            errorFallbackAnswer = `В вашей зоне ${projects?.length || 0} комнат и ${members?.length || 0} участников.`;
          }

         // Добавляем найденные ссылки на конкретные сущности
         if (entityLinks.length > 0) {
           errorFallbackAnswer += `\n\nПрямые ссылки: ${entityLinks.join(" | ")}`;
         }

         res.status(200).json({ answer: errorFallbackAnswer });
         return;
       }
      res.status(500).json({ message: "Gemini API error", details: text });
      return;
    }

    const data: any = await response.json();
    let answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || "(пустой ответ)";
    if (introduceLine) {
      answer = introduceLine;
    }
    if (entityLinks.length) {
      answer = `Ссылки: ${entityLinks.join(" | ")}` + (answer ? `\n\n${answer}` : "");
    }
    res.status(200).json({ answer });
  } catch (err: any) {
    res.status(500).json({ message: "AI query failed", error: err?.message || String(err) });
  }
});

export default aiRoutes;


