import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ValidatorFn,
} from '@angular/forms';
import Ajv from 'ajv-draft-04';
import { map, Observable } from 'rxjs';
import { getOrElse } from 'src/app/util/functions/get-or-throw.fn';
import {
  JSONSchemaProperty,
  JSONSchemaPropertyArray,
  JSONSchemaPropertyEnum,
  JSONSchemaPropertyPrimitive,
  WorkflowTask,
} from 'src/app/util/types/task.type';
import { SchemasService } from '../schemas/schemas.service';
import { group } from '@angular/animations';

@Injectable({
  providedIn: 'root',
})
export class TaskBuilderService {
  constructor(private schemasService: SchemasService) {}

  createWorkflowTask(
    taskType: string,
    shape: string,
    coordinates: { x: number; y: number }
  ): Observable<WorkflowTask> {
    return this.schemasService.getSchemaByName(taskType).pipe(
      map((schema) => {
        const properties = { ...schema.properties };

        delete (properties as Record<string, unknown>)['order'];
        delete (properties as Record<string, unknown>)['taskType'];

        const form = this.createTaskGroup(
          properties,
          getOrElse(schema.required, [])
        );

        const order = new FormControl(undefined);
        form.group.addControl('order', order);

        const type = new FormControl(taskType);
        form.group.addControl('taskType', type);

        return { form, taskType: type, order, schema, coordinates, shape };
      })
    );
  }

  createTaskGroup(
    properties: Record<string, JSONSchemaProperty>,
    required: string[]
  ) {
    const group = new FormGroup({});
    const controls = Object.keys(properties).map((key) => {
      const property = properties[key];

      let builder: TaskBuilderService['createTaskControl'];

      if ('items' in property) builder = this.createTaskArray;
      else if ('type' in property) builder = this.createTaskControl;
      else if ('enum' in property) builder = this.createTaskEnum;
      else throw 'unknown property type';

      return builder.bind(this)(group, key, property, required.includes(key));
    });

    return { group, controls };
  }

  private createTaskEnum(
    group: FormGroup | FormArray,
    key: string,
    _property: JSONSchemaProperty,
    required: boolean
  ) {
    const property = _property as JSONSchemaPropertyEnum;

    const details: WorkflowTask['form']['controls'][0] = {
      key,
      description: property.description,
      control: new FormControl(
        '',
        this.createValidator(key, property, required)
      ),
      controlType: 'control',
      componente: 'select',
      componenteType: 'none',
      componenteLabel: this.getComponentLabel(key),
      children: [],
      options: property.enum.map((x) => ({ name: x, value: x })),
    };

    if ('addControl' in group) {
      group.addControl(key, details.control);
    } else {
      group.push(details.control);
    }

    return details;
  }

  private createTaskArray(
    group: FormGroup | FormArray,
    key: string,
    _property: JSONSchemaProperty,
    required: boolean
  ) {
    const property = _property as JSONSchemaPropertyArray;

    const array: FormArray = new FormArray([] as any[]);

    const children = required
      ? (() => {
          const child = this.createTaskGroup(
            property.items.properties,
            property.items.required ?? []
          );
          child.group.setParent(array);
          return [child];
        })()
      : [];

    if ('addControl' in group) {
      group.addControl(key, array);
    } else {
      group.push(array);
    }

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

  private createTaskControl(
    group: FormGroup | FormArray,
    key: string,
    _property: JSONSchemaProperty,
    required: boolean
  ) {
    const property = _property as JSONSchemaPropertyPrimitive;

    const componenteType = property.type.includes('string')
      ? 'string'
      : 'number';

    const details: WorkflowTask['form']['controls'][0] = {
      key,
      description: property.description,
      control: new FormControl(
        componenteType === 'string' ? '' : NaN,
        this.createValidator(key, property, required)
      ),
      controlType: 'control',
      componente: 'input',
      componenteType,
      componenteLabel: this.getComponentLabel(key),
      children: [],
    };

    if ('addControl' in group) {
      group.addControl(key, details.control);
    } else {
      group.push(details.control);
    }

    return details;
  }

  private createValidator(
    key: string,
    property: JSONSchemaProperty,
    required: boolean
  ) {
    const schemaValidator = {
      $schema: 'http://json-schema.org/draft-04/schema#',
      $id: key,
      type: 'object',
      properties: {
        [key]: property,
      },
      required: required ? [key] : undefined,
    };

    const ajv = new Ajv({ strict: 'log' });

    const validate = ajv.compile(schemaValidator);

    const controlValidator: ValidatorFn = (
      control: AbstractControl
    ): { [key: string]: unknown } | null => {
      const valid = validate({ [key]: control.value });
      console.log(valid);
      if (valid) return null;
      return { ajv: validate.errors };
    };

    return controlValidator;
  }

  private getComponentLabel(str: string) {
    const spaced = str.replace(/([A-Z])/g, ' $1');
    const titleCase = spaced.replace(/\b\w/g, (char) => char.toUpperCase());
    return titleCase.trim();
  }
}
