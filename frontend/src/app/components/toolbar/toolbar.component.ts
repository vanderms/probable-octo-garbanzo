import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { TasksService } from 'src/app/services/tasks/tasks.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent {
  constructor(private tasksService: TasksService) {}

  protected collapsed$ = new BehaviorSubject(false);

  protected selectedTask$ = this.tasksService
    .getSelectedTask()
    .pipe(tap(console.log));

  protected supportedTasks$ = this.tasksService.getSupportedTasks();

  openTaskbar(details: HTMLDetailsElement) {
    if (this.collapsed$.value) {
      this.collapsed$.next(false);
      requestAnimationFrame(() => (details.open = true));
    }
  }

  protected toggleTask(task: string) {
    this.tasksService.toggleTask(task);
  }
}
