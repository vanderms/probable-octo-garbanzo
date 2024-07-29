import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  filter,
  map,
  shareReplay,
  take,
  tap,
} from 'rxjs';
import { EnvironmentService } from '../environment/environment.service';
import { SupportedTasks } from './types/supported-tasks';
import { TaskSchema } from './types/task';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  constructor(
    private http: HttpClient,
    private envService: EnvironmentService
  ) {}

  private taskSchemas = new Map<
    string,
    BehaviorSubject<TaskSchema | undefined>
  >();

  noTaskSelected = { name: '__NONE__', shape: '__NONE__' };

  private selectedTask$ = new BehaviorSubject(this.noTaskSelected);

  selectTask(task: string) {
    this.selectedTask$.next({ name: task, shape: this.getTaskShape(task) });
  }

  toggleTask(task: string) {
    if (this.selectedTask$.value.name !== task) this.selectTask(task);
    else this.unselectTask();
  }

  unselectTask() {
    this.selectedTask$.next(this.noTaskSelected);
  }

  getSelectedTask() {
    return this.selectedTask$;
  }

  private supportedTasks$ = this.http
    .get<SupportedTasks>(
      `${this.envService.getEnvironment().serverUrl}/schemas/tasks/supported`
    )
    .pipe(
      map(({ taskTypes }) => taskTypes),
      shareReplay({ bufferSize: 1, refCount: true })
    );

  getSupportedTasks() {
    return this.supportedTasks$.pipe(
      map((tasks) =>
        tasks.map((task) => ({
          shape: this.getTaskShape(task),
          name: task,
        }))
      )
    );
  }

  getTaskShape(taskName: string) {
    if (taskName === 'START' || taskName === 'END') return 'ellipse';
    return 'rectangle';
  }

  getTaskSchema(name: string) {
    let response$: Observable<TaskSchema | undefined>;

    const cache = this.taskSchemas.get(name);

    if (cache) {
      response$ = cache;
    } //
    else {
      const schema$ = new BehaviorSubject<TaskSchema | undefined>(undefined);
      response$ = schema$.asObservable();

      this.taskSchemas.set(name, schema$);

      this.http
        .get<TaskSchema>(
          `${this.envService.getEnvironment().serverUrl}/schemas/tasks/${name}`
        )
        .pipe(
          tap((schema) => schema$.next(schema)),
          take(1)
        )
        .subscribe();
    }

    return response$.pipe(
      filter(<T>(schema: T | undefined): schema is T => !!schema)
    );
  }
}
