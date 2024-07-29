import { FormGroup } from '@angular/forms';

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
    properties: JSONSchemaProperty;
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

export type WorkflowTask = {
  group: FormGroup;
  schema: JSONSchema;
  coordinates: { x: number; y: number };
  shape: string;
};
