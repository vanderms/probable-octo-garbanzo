import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  combineLatest,
  map,
  shareReplay,
  switchMap
} from 'rxjs';
import { getOrThrow } from 'src/app/util/functions/get-or-throw.fn';
import { JSONSchema } from 'src/app/util/types/task.type';
import { EnvironmentService } from '../environment/environment.service';
import { SupportedTasksService } from '../supported-tasks/supported-tasks.service';

@Injectable({
  providedIn: 'root',
})
export class SchemasService {
  constructor(
    private http: HttpClient,
    private env: EnvironmentService,
    public supportedService: SupportedTasksService
  ) {}

  private schemasTable$ = this.supportedService.getSupportedTasks().pipe(
    switchMap((tasks) => {
      return combineLatest([
        ...tasks.map((name) => this.loadTaskSchema(name)),
        this.loadCommonsSchema(),
        this.loadWorkflowSchema(),
      ]);
    }),
    map((schemas) => {
      const map = new Map<string, JSONSchema>();
      schemas.forEach((schema) => {
        map.set(schema.$id, schema);
      });
      return map;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private loadTaskSchema(name: string) {
    return this.http.get<JSONSchema>(
      `${this.env.get().serverUrl}/schemas/tasks/${
        name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
      }Task`
    );
  }

  private loadCommonsSchema() {
    return this.http.get<JSONSchema>(
      `${this.env.get().serverUrl}/schemas/tasks/Commons`
    );
  }

  private loadWorkflowSchema() {
    return this.http.get<JSONSchema>(
      `${this.env.get().serverUrl}/schemas/workflow`
    );
  }

  getSchema(id: string) {
    return this.schemasTable$.pipe(
      map((table) => {
        return getOrThrow(table.get(id), 'schema not found');
      })
    );
  }
  getTaskSchema(name: string) {
    const id = `${
      name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
    }Task.json`;

    return this.getSchema(id);
  }

  getWorkflowSchema() {
    return this.getSchema('./WorkflowSchema.json');
  }

  getCommonsSchema() {
    return this.getSchema('./Commons.json');
  }
}
