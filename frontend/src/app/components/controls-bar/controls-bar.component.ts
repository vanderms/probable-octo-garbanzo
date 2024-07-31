import { Component } from '@angular/core';
import { ControlService } from 'src/app/services/control/control.service';
import { WorkflowService } from 'src/app/services/workflow/workflow.service';
import { Direction } from 'src/app/util/types/directions';
import { WorkflowTask } from 'src/app/util/types/task.type';

@Component({
  selector: 'app-controls-bar',
  templateUrl: './controls-bar.component.html',
  styleUrls: ['./controls-bar.component.css'],
})
export class ControlsBarComponent {
  constructor(
    private controlService: ControlService,
    private workflowService: WorkflowService
  ) {}

  protected Direction = Direction;

  protected moveCanvas(direction: Direction) {
    this.controlService.setDirection(direction);
  }

  selectedTask$ = this.workflowService.getCurrentTask();

  removeTask(task: WorkflowTask | null) {
    if (task) {
      this.workflowService.removeTask(task);
    }
  }
}
