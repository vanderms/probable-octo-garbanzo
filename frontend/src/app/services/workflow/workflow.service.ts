import { Injectable } from '@angular/core';
import { BehaviorSubject, first, Observable } from 'rxjs';
import { WorkflowTask } from 'src/app/util/types/task.type';
import { Workflow } from 'src/app/util/types/workflow.type';

@Injectable({
  providedIn: 'root',
})
export class WorkflowService {
  current$ = new BehaviorSubject<null | Workflow>(null);

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
        console.log(this.current$.value);
      }
    });
  }

  changeOrder(task: WorkflowTask) {
    if (this.current$.value) {
      const tasks = this.current$.value.tasks;

      const current = tasks.indexOf(task);
      const target = task.order.value as number;

      if (
        current >= 0 &&
        current <= tasks.length &&
        target >= 0 &&
        target <= tasks.length
      ) {
        tasks.splice(current, 1);
        tasks.splice(target, 0, task);
        tasks.forEach((task, i) => {
          task.order.setValue(i + 1);
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
