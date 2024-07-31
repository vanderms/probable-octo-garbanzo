import { Injectable } from '@angular/core';
import { BehaviorSubject, first, Observable } from 'rxjs';
import { WorkflowTask } from 'src/app/util/types/task.type';
import { Workflow } from 'src/app/util/types/workflow.type';

@Injectable({
  providedIn: 'root',
})
export class WorkflowService {
  private currentWorkflow$ = new BehaviorSubject<null | Workflow>(null);

  private currentTask$ = new BehaviorSubject<WorkflowTask | null>(null);

  getWorkflow() {
    return this.currentWorkflow$.asObservable();
  }

  getCurrentTask() {
    return this.currentTask$.asObservable();
  }

  setCurrentTask(task: WorkflowTask | null) {
    this.currentTask$.next(task);
  }

  addTask(task$: Observable<WorkflowTask>) {
    if (!this.currentWorkflow$.value) {
      this.currentWorkflow$.next({
        name: '',
        tasks: [],
        description: '',
        archived: false,
        category: '',
        context: [],
        operation: 'init',
      });
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
