export interface TaskSchema {
  $schema: string;
  $id: string;
  type: string;
  properties: {
    name: {
      type: 'string';
    };
    taskType: {
      $ref: './Commons.json#/definitions/taskType';
    };
    order: {
      type: 'number';
    };
    [key: string]:
      | {
          type: string;
        }
      | { $ref: string };
  };

  required: string[] | undefined;
}

export interface Task {
  name: string;
  taskType: string;
  order: number;
  [key: string]: unknown;
}
