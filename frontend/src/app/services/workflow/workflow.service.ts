import { Injectable } from '@angular/core';
import Ajv from 'ajv-draft-04';
import { BehaviorSubject, first, map, Observable, of, switchMap } from 'rxjs';
import { WorkflowTask } from 'src/app/util/types/task.type';
import { Workflow } from 'src/app/util/types/workflow.type';
import { SchemasService } from '../schemas/schemas.service';
import { error } from 'ajv/dist/vocabularies/applicator/dependencies';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from '../environment/environment.service';

@Injectable({
  providedIn: 'root',
})
export class WorkflowService {
  constructor(
    private schemaService: SchemasService,
    private http: HttpClient,
    private env: EnvironmentService
  ) {}
  private currentWorkflow$ = new BehaviorSubject<null | Workflow>(null);

  private currentTask$ = new BehaviorSubject<WorkflowTask | null>(null);

  workflowSchema$ = this.schemaService.getWorkflowSchema();

  getWorkflow() {
    return this.currentWorkflow$.asObservable();
  }

  getCurrentTask() {
    return this.currentTask$.asObservable();
  }

  setCurrentTask(task: WorkflowTask | null) {
    this.currentTask$.next(task);
  }

  createWorkflow() {
    this.currentTask$.next(null);
    this.currentWorkflow$.next({
      name: 'name',
      tasks: [],
      description: 'description',
      archived: false,
      category: 'category',
      context: [],
      operation: 'init',
    });
  }

  addTask(task$: Observable<WorkflowTask>) {
    if (!this.currentWorkflow$.value) {
      this.createWorkflow();
    }
    task$.pipe(first()).subscribe((task) => {
      const current = this.currentWorkflow$.value;

      if (current) {
        task.order.setValue(current.tasks.length + 1);
        const next: Workflow = {
          ...current,
          tasks: [...current.tasks, task],
          operation: 'added',
        };
        this.currentWorkflow$.next(next);
        this.currentTask$.next(task);
      }
    });
  }

  removeTask(task: WorkflowTask) {
    if (!this.currentWorkflow$.value) return false;

    if (this.currentTask$.value === task) {
      this.currentTask$.next(null);
    }
    const tasks = this.currentWorkflow$.value.tasks.filter((t) => task !== t);

    if (tasks.length === this.currentWorkflow$.value.tasks.length) return false;

    tasks.forEach((task, i) => {
      task.order.setValue(i + 1, { emitEvent: false });
    });

    this.currentWorkflow$.next({
      ...this.currentWorkflow$.value,
      tasks,
      operation: 'changed',
    });

    return true;
  }

  saveWorkflow() {
    return this.workflowSchema$.pipe(
      map((schema): { error: string } | { payload: object } => {
        const workflow = this.currentWorkflow$.value;

        if (!workflow) return { error: 'no workflow to save' };

        if (
          workflow.tasks.length < 1 ||
          workflow.tasks[0].taskType.value !== 'START'
        ) {
          return {
            error: 'The workflow must start with a task of type START.',
          };
        }

        if (
          workflow.tasks[workflow.tasks.length - 1].taskType.value !== 'END'
        ) {
          return {
            error: 'Error: the last task of the workflow must be of type END.',
          };
        }

        const payload = {
          ...workflow,
          tasks: workflow.tasks.map((task) => task.form.group.value),
        };

        console.log(payload);

        const ajv = new Ajv({ strict: 'log' });

        const validate = ajv.compile(schema);

        const valid = validate(payload);

        if (!valid) {
          console.warn(validate.errors);
          return { error: 'Error: the current workflow has errors!' };
        }

        return { payload };
      }),
      switchMap((status) => {
        if ('error' in status) return of(status.error);

        return this.http.post(
          `${this.env.get().serverUrl}/workflows`,
          status.payload
        );
      }),
      map((status) => {
        if (typeof status === 'string')
          return of({ status: 'error', message: status });
        return {
          status: 'success',
          message: 'Operation completed successfully!',
        };
      })
    );
  }

  changeOrder(task: WorkflowTask) {
    if (this.currentWorkflow$.value) {
      const tasks = this.currentWorkflow$.value.tasks;

      const current = tasks.indexOf(task);
      const target = Number(task.order.value);

      console.log(tasks);

      if (
        current >= 0 &&
        current <= tasks.length &&
        target >= 0 &&
        target <= tasks.length
      ) {
        tasks.splice(current, 1);
        tasks.splice(target - 1, 0, task);

        tasks.forEach((task, i) => {
          task.order.setValue(i + 1, { emitEvent: false });
        });

        this.currentWorkflow$.next({
          ...this.currentWorkflow$.value,
          tasks,
          operation: 'changed',
        });
        return true;
      }
    }

    throw Error('Failed to change tasks order.');
  }
}
