import { Injectable } from '@angular/core';
import { BehaviorSubject, first, Observable } from 'rxjs';
import { WorkflowTask } from 'src/app/util/types/task.type';
import { Workflow } from 'src/app/util/types/workflow.type';

@Injectable({
  providedIn: 'root',
})
export class WorkflowService {
  private current$ = new BehaviorSubject<null | Workflow>(null);

  private currentTask$ = new BehaviorSubject<WorkflowTask | null>(null);

  getWorkflow() {
    return this.current$.asObservable();
  }

  getCurrentTask() {
    return this.currentTask$.asObservable();
  }

  setCurrentTask(task: WorkflowTask | null) {
    this.currentTask$.next(task);
  }

  addTask(task$: Observable<WorkflowTask>) {
    if (!this.current$.value) {
      this.current$.next({
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
      const current = this.current$.value;

      if (current) {
        task.order.setValue(current.tasks.length + 1);
        const next: Workflow = {
          ...current,
          tasks: [...current.tasks, task],
          operation: 'added',
        };
        this.current$.next(next);
        this.currentTask$.next(task);
      }
    });
  }

  changeOrder(task: WorkflowTask) {
    if (this.current$.value) {
      const tasks = this.current$.value.tasks;

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

        this.current$.next({
          ...this.current$.value,
          tasks,
          operation: 'changed',
        });
        return true;
      }
    }

    throw Error('Failed to change tasks order.');
  }
}
