import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  combineLatest,
  map,
  of,
  shareReplay,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { getOrElse, getOrThrow } from 'src/app/util/functions/get-or-throw.fn';
import { JSONSchema, JSONSchemaProperty } from 'src/app/util/types/task.type';
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
  ) {
    //eager loading
    this.getWorkflowSchema().pipe(take(1)).subscribe();
  }

  private schemasTable$ = this.supportedService.getSupportedTasks().pipe(
    switchMap((tasks) => {
      return combineLatest([
        this.loadCommonsSchema(),
        ...tasks.map((name) => this.loadTaskSchema(name)),
      ]);
    }),
    map(([commons, ...schemas]) => {
      const definitions = getOrElse(commons.definitions, {});
      schemas.forEach((schema) => {
        this.replaceReferences(schema as Record<string, unknown>, definitions);
      });

      return schemas;
    }),
    map((schemas) => {
      const table = new Map<string, JSONSchema>();
      schemas.forEach((schema) => {
        table.set(schema.$id, schema);
      });
      return table;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private workflowSchema$ = this.schemasTable$.pipe(
    switchMap((table) => {
      return combineLatest([
        of(table),
        this.http.get<any>(`${this.env.get().serverUrl}/schemas/workflow`),
      ]);
    }),
    map(([table, schema]) => {
      console.log(schema, table);
      schema.properties.tasks.items.anyOf = [...table.values()];

      delete schema.properties.context;
      return schema as JSONSchema;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  getWorkflowSchema() {
    return this.workflowSchema$;
  }

  private replaceReferences(
    schema: Record<string, unknown>,
    definitions: Record<string, JSONSchemaProperty>
  ) {
    Object.keys(schema).forEach((key) => {
      if (key === '$ref') {
        const value = (schema[key] as string)
          .replace('./Commons.json#/definitions/', '')
          .trim();

        delete schema[key];

        for (const k in definitions[value]) {
          schema[k] = (definitions[value] as Record<string, unknown>)[k];
        }
      }
      //
      else if (typeof schema[key] === 'object' && schema[key] !== null) {
        this.replaceReferences(
          schema[key] as Record<string, unknown>,
          definitions
        );
      }
    });
  }

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

  getSchemaById(id: string) {
    return this.schemasTable$.pipe(
      map((table) => {
        return getOrThrow(table.get(id), 'schema not found');
      })
    );
  }
  getSchemaByName(name: string) {
    const id = `./${
      name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
    }Task.json`;

    return this.getSchemaById(id);
  }
}
