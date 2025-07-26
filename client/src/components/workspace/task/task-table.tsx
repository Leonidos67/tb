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
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React from "react";

type Filters = ReturnType<typeof useTaskTableFilter>[0];
type SetFilters = ReturnType<typeof useTaskTableFilter>[1];

interface DataTableFilterToolbarProps {
  isLoading?: boolean;
  projectId?: string;
  filters: Filters;
  setFilters: SetFilters;
}

interface TaskTableProps {
  defaultStatusFilter?: string;
}

const TaskTable = ({ defaultStatusFilter }: TaskTableProps) => {
  const param = useParams();
  const projectId = param.projectId as string;

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [filters, setFilters] = useTaskTableFilter();
  // Устанавливаем фильтр по статусу при первом рендере, если передан defaultStatusFilter
  React.useEffect(() => {
    if (defaultStatusFilter && !filters.status) {
      setFilters({ ...filters, status: defaultStatusFilter });
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

  return (
    <div className="w-full relative">
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
        filtersToolbar={
          <DataTableFilterToolbar
            isLoading={isLoading}
            projectId={projectId}
            filters={filters}
            setFilters={setFilters}
          />
        }
      />
    </div>
  );
};

const DataTableFilterToolbar: FC<DataTableFilterToolbarProps> = ({
  isLoading,
  projectId,
  filters,
  setFilters,
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
