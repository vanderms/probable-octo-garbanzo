import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { SupportedTasksService } from '../supported-tasks/supported-tasks.service';

@Injectable({
  providedIn: 'root',
})
export class ToolbarService {
  constructor(private supportedService: SupportedTasksService) {}

  emptyTask = { name: '', shape: '' };

  private selectedTask$ = new BehaviorSubject(this.emptyTask);

  private getTaskShape(taskName: string) {
    if (taskName === 'START' || taskName === 'END') return 'ellipse';
    return 'rectangle';
  }

  getSupportedTasksWithShape() {
    return this.supportedService.getSupportedTasks().pipe(
      map((tasks) => {
        return tasks.map((task) => ({
          name: task,
          shape: this.getTaskShape(task),
        }));
      })
    );
  }

  selectTask(task: string) {
    this.selectedTask$.next({ name: task, shape: this.getTaskShape(task) });
  }

  toggleTask(task: string) {
    if (this.selectedTask$.value.name !== task) this.selectTask(task);
    else this.unselectTask();
  }

  unselectTask() {
    this.selectedTask$.next(this.emptyTask);
  }

  getSelectedTask() {
    return this.selectedTask$;
  }
}
