import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map, tap } from 'rxjs';
import { WorkflowService } from 'src/app/services/workflow/workflow.service';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormComponent {
  constructor(private workflowService: WorkflowService) {}

  task$ = this.workflowService.getCurrentTask().pipe(
    map((task) => ({ task })),
    tap(console.log)
  );

  workflow$ = this.workflowService.getWorkflow();
}
