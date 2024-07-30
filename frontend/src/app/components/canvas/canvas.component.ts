import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, map, take, tap } from 'rxjs';
import { TaskBuilderService } from 'src/app/services/task-builder/task-builder.service';
import { ToolbarService } from 'src/app/services/toolbar/toolbar.service';
import { WorkflowService } from 'src/app/services/workflow/workflow.service';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CanvasComponent {
  constructor(
    private toolbarService: ToolbarService,
    private taskBuilder: TaskBuilderService,
    private workflowService: WorkflowService
  ) {}

  cursor$ = new BehaviorSubject('');

  readonly gridSize = 24;

  selectedTask$ = this.toolbarService.getSelectedTask().pipe(
    tap((task) => {
      const next = task !== this.toolbarService.emptyTask ? 'crosshair' : '';
      if (next !== this.cursor$.value) {
        this.cursor$.next(next);
      }
    }),
    map((task) => (task !== this.toolbarService.emptyTask ? task : null))
  );

  onContainerInteraction(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      this.selectedTask$.pipe(take(1)).subscribe((task) => {
        if (task) {
          const task$ = this.taskBuilder.createWorkflowTask(
            task.name,
            task.shape,
            this.calcCoordinates(e)
          );
          this.workflowService.addTask(task$);
          this.toolbarService.unselectTask();
        }
      });
    }
  }

  private calcCoordinates(event: MouseEvent) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const relativeX = event.clientX - rect.left;
    const relativeY = event.clientY - rect.top;

    const x = Math.floor(relativeX / this.gridSize) * this.gridSize;
    const y = Math.floor(relativeY / this.gridSize) * this.gridSize;
    return { x, y };
  }
}
