import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, map, take, tap } from 'rxjs';
import { TasksService } from 'src/app/services/tasks/tasks.service';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CanvasComponent {
  constructor(private tasksService: TasksService) {}

  cursor$ = new BehaviorSubject('');

  selectedTask$ = this.tasksService.getSelectedTask().pipe(
    tap((task) => {
      const next = task !== this.tasksService.noTaskSelected ? 'crosshair' : '';
      if (next !== this.cursor$.value) {
        this.cursor$.next(next);
      }
    }),
    map((task) => (task !== this.tasksService.noTaskSelected ? task : null))
  );

  onContainerClick(e: Event) {
    if (e.target === e.currentTarget) {
      this.selectedTask$.pipe(take(1)).subscribe(task => {
        if(task){
          
        }
      });
    }
  }
}
