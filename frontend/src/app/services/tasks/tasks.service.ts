import { Injectable } from '@angular/core';
import { SchemasService } from '../schemas/schemas.service';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { ExtendedControl, JSONSchema } from 'src/app/util/types/task.type';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  constructor(
    private schemasService: SchemasService,
    private fb: NonNullableFormBuilder
  ) {}

  createTask() {}

  createFormGroup(schema: JSONSchema) {
    const group = this.fb.group({});

    Object.keys(schema.properties).forEach((key) => {
      const property = schema.properties[key];

      if ('type' in property && !('items' in property)) {
        const control = new FormControl(undefined) as ExtendedControl;

        control.__hfgExtended__ = {
          type: property.type.includes('string') ? 'string' : 'number',
          options: [],
          field: 'input',
        };

        if (schema.required && schema.required.includes(key))
          control.addValidators(Validators.required);

        return group.addControl(key, new FormControl(''));
      }
    });
  }
}
