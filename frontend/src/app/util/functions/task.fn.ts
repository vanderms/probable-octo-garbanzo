import { TasksService } from 'src/app/services/tasks/tasks.service';
import { JSONSchema } from '../types/task.type';


const createTask = (taskService: TasksService, schema: JSONSchema) => {



};

export const WorkflowTaskFactory = {
  create: createTask,
};
