import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
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

@Injectable({
  providedIn: 'root',
})
export class TaskBuilderService {
  constructor(private schemasService: SchemasService) {}

  private removeDisabledCallback = () => undefined;

  isRemoveDisabled(callback: () => void) {
    return this.removeDisabledCallback === callback;
  }

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
        delete (properties as Record<string, unknown>)['name'];

        const form = this.createTaskGroup(
          properties,
          getOrElse(schema.required, [])
        );

        const name = new FormControl('', Validators.required);
        form.group.addControl('name', name);

        const order = new FormControl(undefined, Validators.required);
        form.group.addControl('order', order);

        const type = new FormControl(taskType);
        form.group.addControl('taskType', type);

        return {
          form,
          taskType: type,
          order,
          name,
          schema,
          coordinates,
          shape,
        };
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

    return { group, controls, remove: this.removeDisabledCallback };
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
      create: () => undefined,
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
          array.push(child.group);

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
      create: () => undefined,
    };

    const create = () => {
      const child: WorkflowTask['form'] = this.createTaskGroup(
        property.items.properties,
        property.items.required ?? []
      );

      array.push(child.group);
      details.children.push(child);

      const remove = () => {
        details.children = details.children.filter((x) => x !== child);
        const index = array.controls.indexOf(child.group);
        if (index !== -1) {
          array.removeAt(index);
        }
      };

      child.remove = remove;
    };

    details.create = create;

    return details;
  }

  private createTaskControl(
    group: FormGroup | FormArray,
    key: string,
    _property: JSONSchemaProperty,
    required: boolean
  ) {
    const property = _property as JSONSchemaPropertyPrimitive;

    const componenteType = property.type.includes('string') ? 'text' : 'number';

    const details: WorkflowTask['form']['controls'][0] = {
      key,
      description: property.description,
      control: new FormControl(
        componenteType === 'text' ? '' : NaN,
        this.createValidator(key, property, required)
      ),
      controlType: 'control',
      componente: 'input',
      componenteType,
      componenteLabel: this.getComponentLabel(key),
      children: [],
      create: () => undefined,
    };

    if (componenteType === 'number') {
      details.control.valueChanges.subscribe((value) => {
        if (typeof value === 'string') {
          let x = Number(value);
          if (isNaN(x)) x = 0;
          details.control.setValue(x, { emitEvent: false });
        }
      });
    }

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
