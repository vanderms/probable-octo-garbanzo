import { Injectable } from '@angular/core';
import { SchemasService } from '../schemas/schemas.service';
import { FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { JSONSchema } from 'src/app/util/types/task.type';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  constructor(
    private schemasService: SchemasService,
    private fb: NonNullableFormBuilder
  ) {}

  createTask() {}

 
}
