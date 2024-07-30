import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { SchemasService } from 'src/app/services/schemas/schemas.service';
import { ToolbarService } from 'src/app/services/toolbar/toolbar.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent {
  constructor(
    private toolbarService: ToolbarService,
    private schemas: SchemasService
  ) {
    schemas.getSchemaByName('END').subscribe();
  }

  protected collapsed$ = new BehaviorSubject(false);

  protected selectedTask$ = this.toolbarService
    .getSelectedTask()
    .pipe(tap(console.log));

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
}
