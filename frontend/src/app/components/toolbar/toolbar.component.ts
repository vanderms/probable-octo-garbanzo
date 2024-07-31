import {
  ChangeDetectionStrategy,
  Component,
  ViewChild
} from '@angular/core';
import { BehaviorSubject, EMPTY, map, switchMap, take, tap } from 'rxjs';
import { ToolbarService } from 'src/app/services/toolbar/toolbar.service';
import { WorkflowService } from 'src/app/services/workflow/workflow.service';
import { getOrThrow } from 'src/app/util/functions/get-or-throw.fn';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent {
  constructor(
    private toolbarService: ToolbarService,
    private workflowService: WorkflowService
  ) {}

  protected collapsed$ = new BehaviorSubject(false);

  @ViewChild(DialogComponent) _dialogComponent?: DialogComponent;

  get dialog() {
    return getOrThrow(this._dialogComponent);
  }

  protected selectedTask$ = this.toolbarService.getSelectedTask();

  protected supportedTasks$ = this.toolbarService.getSupportedTasksWithShape();

  openTaskbar(details: HTMLDetailsElement) {
    if (this.collapsed$.value) {
      this.collapsed$.next(false);
      requestAnimationFrame(() => (details.open = true));
    }
  }

  protected toggleTask(task: string) {
    this.toolbarService.toggleTask(task);
  }

  dialogMessages = {
    create:
      'You have unsaved changes. Are you sure you want to create a new workflow?',
    clear: 'Do you confirm that you want to clear the current workflow?',
    save: 'Operation completed successfully!',
  };

  dialogMessage$ = new BehaviorSubject('');

  createWorkflow() {
    this.workflowService
      .getWorkflow()
      .pipe(
        take(1),
        map((workflow) => !!workflow && workflow.tasks.length),
        switchMap((unsavedChanges) => {
          if (unsavedChanges) {
            this.dialogMessage$.next(this.dialogMessages.create);
            return this.dialog.showModal();
          } else {
            this.workflowService.createWorkflow();
            return EMPTY;
          }
        }),
        tap((response) => {
          if (response === 'CONFIRM') this.workflowService.createWorkflow();
        }),
        take(1)
      )
      .subscribe();
  }

  clearWorkflow() {
    this.workflowService
      .getWorkflow()
      .pipe(
        map((workflow) => !!workflow && workflow.tasks.length),
        switchMap((hasTasks) => {
          if (hasTasks) {
            this.dialogMessage$.next(this.dialogMessages.clear);
            return this.dialog.showModal();
          }
          this.workflowService.createWorkflow();
          return EMPTY;
        }),
        tap((response) => {
          if (response === 'CONFIRM') this.workflowService.createWorkflow();
        }),
        take(1)
      )
      .subscribe();
  }

  saveWorkflow() {
    this.workflowService.saveWorkflow().subscribe(console.log);
  }
}
