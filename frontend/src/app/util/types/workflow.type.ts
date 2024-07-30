import { ValuePair } from 'src/app/util/types/value-pair.type';
import { WorkflowTask } from './task.type';

export type Workflow = {
  name: string;
  tasks: WorkflowTask[];
  description?: string;
  archived?: boolean;
  category?: string;
  context?: ValuePair[];
  operation: 'added' | 'removed' | 'init' | 'changed';
};
