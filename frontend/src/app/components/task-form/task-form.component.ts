import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { TaskBuilderService } from 'src/app/services/task-builder/task-builder.service';
import { WorkflowService } from 'src/app/services/workflow/workflow.service';
import { WorkflowTask } from 'src/app/util/types/task.type';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormComponent {
  constructor(
    private workflowService: WorkflowService,
    private taskService: TaskBuilderService
  ) {}

  task$ = this.workflowService.getCurrentTask();

  changeOrder$ = this.task$.pipe(
    filter(<T>(x: T | null): x is T => !!x),
    switchMap((task) => {
      return combineLatest([of(task), task.order.valueChanges]);
    }),
    tap(([task]) => {
      this.workflowService.changeOrder(task);
    })
  );

  showErrorMessage$ = new BehaviorSubject(false);

  workflow$ = this.workflowService.getWorkflow();

  isRemoveDisabled(callback: () => void) {
    return this.taskService.isRemoveDisabled(callback);
  }

  onClose(task: WorkflowTask) {
    if (task.form.group.invalid) {
      task.form.group.markAllAsTouched();
      this.showErrorMessage$.next(true);
    } else {
      this.workflowService.setCurrentTask(null);
    }
  }
}
