export const TaskStatusEnum = {
  BACKLOG: "BACKLOG",
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  IN_REVIEW: "IN_REVIEW",
  DONE: "DONE",
} as const;

export const TaskPriorityEnum = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT"
};

export type TaskStatusEnumType = (typeof TaskStatusEnum)[keyof typeof TaskStatusEnum];
export type TaskPriorityEnumType = (typeof TaskPriorityEnum)[keyof typeof TaskPriorityEnum];
