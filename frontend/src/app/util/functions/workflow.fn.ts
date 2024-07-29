import { Workflow } from '../types/workflow.type';

export const WorkflowFactory = {
  empty: (): Workflow => {
    return {
      name: '',
      tasks: [],
      description: '',
      archived: false,
      category: '',
      context: [],
    };
  },
};
