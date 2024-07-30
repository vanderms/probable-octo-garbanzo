import { TaskBuilderService } from 'src/app/services/task-builder/tasks.service';
import { JSONSchema } from '../types/task.type';


const createTask = (taskService: TaskBuilderService, schema: JSONSchema) => {



};

export const WorkflowTaskFactory = {
  create: createTask,
};
