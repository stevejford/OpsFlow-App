export interface Assignee {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  assignee?: Assignee;
  dueDate?: string;
  status?: string;
}
