export interface Task {
  id: string;
  userId: string;
  name: string;
  description: string;
  elapsedTime: number; // em segundos
  isRunning: boolean;
  completed?: boolean; // Nova propriedade
}

export interface TaskCreate {
  userId: string;
  name: string;
  description: string;
}

export interface TaskUpdate {
  userId: string;
  name: string;
  description: string;
  elapsedTime: number; // em segundos
  isRunning: boolean;
}
