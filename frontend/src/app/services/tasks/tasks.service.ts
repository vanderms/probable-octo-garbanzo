import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidatorFn,
} from '@angular/forms';
import {
  JSONSchemaProperty,
  JSONSchemaPropertyPrimitive,
  WorkflowTask,
} from 'src/app/util/types/task.type';
import { SchemasService } from '../schemas/schemas.service';
import * as Ajv from 'ajv';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  constructor(
    private schemasService: SchemasService,
    private fb: NonNullableFormBuilder
  ) {}

  createTask() {}

  createTaskGroup(
    properties: Record<string, JSONSchemaProperty>,
    required: string[]
  ) {
    const group = new FormGroup({});
    const controls = Object.keys(properties).map((key) => {
      const property = properties[key];

      if ('items' in property) {
        const array: FormArray = new FormArray([] as any[]);

        const children = required.includes(key)
          ? (() => {
              const child = this.createTaskGroup(
                property.items[0].properties,
                property.items[0].required ?? []
              );

              child.group.setParent(array);

              return [child];
            })()
          : [];

        array.setParent(group);

        const details: WorkflowTask['form']['controls'][0] = {
          key,
          description: property.description,
          control: array,
          controlType: 'array',
          componente: 'none',
          componenteType: 'none',
          componenteLabel: this.getComponentLabel(key),
          children,
          schemaItems: property.items,
        };

        return details;
      }

      if ('type' in property) {
        return this.createTaskControl(
          group,
          key,
          property,
          required.includes(key)
        );
      }
      throw 'not implemented';
    });

    return { group, controls };
  }

  private createTaskControl(
    group: FormGroup | FormArray,
    key: string,
    property: JSONSchemaPropertyPrimitive,
    required: boolean
  ) {
    const details: WorkflowTask['form']['controls'][0] = {
      key,
      description: property.description,
      control: new FormControl(undefined),
      controlType: 'control',
      componente: 'input',
      componenteType: property.type.includes('string') ? 'string' : 'number',
      componenteLabel: this.getComponentLabel(key),
      children: [],
    };

    const schemaValidator = {
      $schema: 'http://json-schema.org/draft-04/schema#',
      $id: key,
      type: 'object',
      properties: {
        [key]: property,
      },
      required: [] as string[],
    };

    if (required) schemaValidator.required.push(key);

    const ajv = new Ajv();
    const validate = ajv.compile(schemaValidator);

    const controlValidator: ValidatorFn = (
      control: AbstractControl
    ): { [key: string]: unknown } | null => {
      const valid = validate({ [key]: control.value });
      if (valid) return null;
      return { schemaError: validate.errors };
    };

    details.control.setParent(group);

    details.control.addValidators(controlValidator);

    return details;
  }

  private getComponentLabel(str: string) {
    const spaced = str.replace(/([A-Z])/g, ' $1');
    const titleCase = spaced.replace(/\b\w/g, (char) => char.toUpperCase());
    return titleCase.trim();
  }
}
