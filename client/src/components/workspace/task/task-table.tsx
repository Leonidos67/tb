import { FC, useState } from "react";
import { getColumns } from "./table/columns";
import { DataTable } from "./table/table";
import { useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { DataTableFacetedFilter } from "./table/table-faceted-filter";
import { statuses } from "./table/data";
import useTaskTableFilter from "@/hooks/use-task-table-filter";
import { useQuery } from "@tanstack/react-query";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { getAllTasksQueryFn } from "@/lib/api";
import { TaskType } from "@/types/api.type";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import { TaskStatusEnumType } from "@/constant";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React from "react";
import WeeklyCalendar from "./weekly-calendar";
import { LayoutGrid, List } from "lucide-react";
import CreateTaskDialog from "./create-task-dialog";

type Filters = ReturnType<typeof useTaskTableFilter>[0];
type SetFilters = ReturnType<typeof useTaskTableFilter>[1];

interface DataTableFilterToolbarProps {
  isLoading?: boolean;
  projectId?: string;
  filters: Filters;
  setFilters: SetFilters;
  columnsControl?: React.ReactNode | null;
}

interface TaskTableProps {
  defaultStatusFilter?: string;
}

const TaskTable = ({ defaultStatusFilter }: TaskTableProps) => {
  const param = useParams();
  const projectId = param.projectId as string;

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [filters, setFilters] = useTaskTableFilter();
  // Устанавливаем фильтр по статусу при первом рендере, если передан defaultStatusFilter
  React.useEffect(() => {
    if (defaultStatusFilter && !filters.status) {
      setFilters({ ...filters, status: defaultStatusFilter as TaskStatusEnumType });
    }
    // eslint-disable-next-line
  }, [defaultStatusFilter]);
  const workspaceId = useWorkspaceId();
  const columns = getColumns(projectId);

  const { data, isLoading } = useQuery({
    queryKey: [
      "all-tasks",
      workspaceId,
      pageSize,
      pageNumber,
      filters,
      projectId,
    ],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
        keyword: filters.keyword,
        priority: filters.priority,
        status: filters.status,
        projectId: projectId || filters.projectId,
        assignedTo: filters.assigneeId,
        pageNumber,
        pageSize,
      }),
    staleTime: 0,
  });

  const tasks: TaskType[] = data?.tasks || [];
  const totalCount = data?.pagination.totalCount || 0;

  const handlePageChange = (page: number) => {
    setPageNumber(page);
  };

  // Handle page size changes
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
  };

  const [viewMode, setViewMode] = useState<"week" | "list">(() => {
    if (typeof window === "undefined") return "week";
    const saved = localStorage.getItem("tasksViewMode");
    return saved === "list" || saved === "week" ? (saved as "list" | "week") : "week";
  });

  React.useEffect(() => {
    try {
      localStorage.setItem("tasksViewMode", viewMode);
    } catch (err) {
      // ignore persistence errors (private mode, disabled storage, etc.)
      void err;
    }
  }, [viewMode]);

  const handleCreateTask = (date: Date) => {
    setSelectedDate(date);
    setIsTaskDialogOpen(true);
  };

  const handleCloseTaskDialog = () => {
    setIsTaskDialogOpen(false);
    setSelectedDate(null);
  };

  return (
    <div className="w-full relative">
      {viewMode === "list" ? (
        <DataTable
          isLoading={isLoading}
          data={tasks}
          columns={columns}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pagination={{
            totalCount,
            pageNumber,
            pageSize,
          }}
          filtersToolbar={(columnsControl) => (
            <DataTableFilterToolbar
              isLoading={isLoading}
              projectId={projectId}
              filters={filters}
              setFilters={setFilters}
              columnsControl={columnsControl}
            />
          )}
          rightHeaderControls={
            <ViewToggle mode={viewMode} onChange={setViewMode} />
          }
        />
      ) : (
        <div className="space-y-2">
          <div className="block w-full lg:flex lg:items-center lg:justify-between">
            <div className="flex-1">
              <DataTableFilterToolbar
                isLoading={isLoading}
                projectId={projectId}
                filters={filters}
                setFilters={setFilters}
                columnsControl={null}
              />
            </div>
            <ViewToggle mode={viewMode} onChange={setViewMode} />
          </div>
          <WeeklyCalendar tasks={tasks} onCreateTask={handleCreateTask} />
        </div>
      )}
      
      <CreateTaskDialog 
        open={isTaskDialogOpen} 
        onOpenChange={handleCloseTaskDialog}
        selectedDate={selectedDate}
      />
    </div>
  );
};

const DataTableFilterToolbar: FC<DataTableFilterToolbarProps> = ({
  isLoading,
  projectId,
  filters,
  setFilters,
  columnsControl,
}) => {
  const workspaceId = useWorkspaceId();

  const { data } = useGetProjectsInWorkspaceQuery({
    workspaceId,
  });

  const { data: memberData } = useGetWorkspaceMembers(workspaceId);

  const projects = data?.projects || [];
  const members = memberData?.members || [];

  //Workspace Projects
  const projectOptions = projects?.map((project) => {
    return {
      label: (
        <div className="flex items-center gap-1">
          <span>{project.emoji}</span>
          <span>{project.name}</span>
        </div>
      ),
      value: project._id,
    };
  });

  // Workspace Memebers
  const assigneesOptions = members?.map((member) => {
    const name = member.userId?.name || "Unknown";
    const initials = getAvatarFallbackText(name);
    const avatarColor = getAvatarColor(name);

    return {
      label: (
        <div className="flex items-center space-x-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={member.userId?.profilePicture || ""} alt={name} />
            <AvatarFallback className={avatarColor}>{initials}</AvatarFallback>
          </Avatar>
          <span>{name}</span>
        </div>
      ),
      value: member.userId._id,
    };
  });

  const handleFilterChange = (key: keyof Filters, values: string[]) => {
    setFilters({
      ...filters,
      [key]: values.length > 0 ? values.join(",") : null,
    });
  };

  return (
    <div className="w-full">
      <div className="w-full mb-2">
        <div className="flex flex-row items-start space-x-2">
          <Input
            placeholder="Поиск тренировок..."
            value={filters.keyword || ""}
            onChange={(e) =>
              setFilters({
                keyword: e.target.value,
              })
            }
            className="h-8 w-full lg:w-[250px]"
          />
          {/* Status filter */}
          <DataTableFacetedFilter
            title="Статус тренировки"
            multiSelect={true}
            options={statuses}
            disabled={isLoading}
            selectedValues={filters.status?.split(",") || []}
            onFilterChange={(values) => handleFilterChange("status", values)}
          />

          {/* Assigned To filter */}
          <DataTableFacetedFilter
            title="Спортсмен"
            multiSelect={true}
            options={assigneesOptions}
            disabled={isLoading}
            selectedValues={filters.assigneeId?.split(",") || []}
            onFilterChange={(values) => handleFilterChange("assigneeId", values)}
          />

          {!projectId && (
            <DataTableFacetedFilter
              title="Комнаты"
              multiSelect={false}
              options={projectOptions}
              disabled={isLoading}
              selectedValues={filters.projectId?.split(",") || []}
              onFilterChange={(values) => handleFilterChange("projectId", values)}
            />
          )}

          {columnsControl}

          {Object.values(filters).some(
            (value) => value !== null && value !== ""
          ) && (
            <Button
              disabled={isLoading}
              variant="ghost"
              className="h-8 px-2 lg:px-3"
              onClick={() =>
                setFilters({
                  keyword: null,
                  status: null,
                  priority: null,
                  projectId: null,
                  assigneeId: null,
                })
              }
            >
              Сбросить фильтры
              <X />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskTable;

function ViewToggle({
  mode,
  onChange,
}: {
  mode: "week" | "list";
  onChange: (m: "week" | "list") => void;
}) {
  const commonBtn = "h-8 px-2 text-sm font-medium";
  const active = "bg-primary text-white border-primary hover:bg-primary";
  const inactive = "bg-white text-foreground hover:bg-gray-50";

  return (
    <div className="flex items-center ml-auto">
      <div className="flex rounded-md border overflow-hidden bg-white">
        <Button
          type="button"
          variant="ghost"
          className={`rounded-none border-r ${commonBtn} ${mode === "week" ? active : inactive}`}
          aria-label="Неделя"
          onClick={() => onChange("week")}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={`rounded-none ${commonBtn} ${mode === "list" ? active : inactive}`}
          aria-label="Список"
          onClick={() => onChange("list")}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
