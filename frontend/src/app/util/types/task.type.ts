import { AbstractControl, FormControl, FormGroup } from '@angular/forms';

export type JSONSchemaPropertyPrimitive = {
  type: string;
  description: string;
};

export type JSONSchemaPropertyEnum = {
  enum: string[];
  description: string;
};

export type JSONSchemaRef = {
  $ref: string;
};

export type JSONSchemaPropertyArray = {
  type: 'array';
  description: string;
  items: Array<{
    properties: Record<string, JSONSchemaProperty>;
    required: string[] | undefined;
  }>;
};

export type JSONSchemaProperty =
  | JSONSchemaPropertyPrimitive
  | JSONSchemaPropertyEnum
  | JSONSchemaRef
  | JSONSchemaPropertyArray;

export type JSONSchema = {
  $schema: string;
  $id: string;
  type: string;
  properties: Record<string, JSONSchemaProperty>;
  required: string[] | undefined;
};

export interface WorkflowTask {
  form: {
    group: FormGroup;
    controls: Array<{
      key: string;
      description: string;
      control: AbstractControl;
      controlType: 'group' | 'array' | 'control';
      options?: Array<{ name: string; value: unknown }>;
      componente: 'input' | 'select' | 'none';
      componenteType: 'number' | 'string' | 'none';
      componenteLabel: string;
      children: Array<WorkflowTask['form']>;
      schemaItems?: JSONSchemaPropertyArray['items'];
    }>;
  };
  schema: JSONSchema;
  coordinates: { x: number; y: number };
  shape: string;
}
