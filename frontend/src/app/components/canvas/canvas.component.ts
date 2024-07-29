import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';
import { BehaviorSubject, map, take, tap } from 'rxjs';
import { ToolbarService } from 'src/app/services/toolbar/toolbar.service';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CanvasComponent {
  constructor(private toolbarService: ToolbarService) {}

  cursor$ = new BehaviorSubject('');

  selectedTask$ = this.toolbarService.getSelectedTask().pipe(
    tap((task) => {
      const next = task !== this.toolbarService.emptyTask ? 'crosshair' : '';
      if (next !== this.cursor$.value) {
        this.cursor$.next(next);
      }
    }),
    map((task) => (task !== this.toolbarService.emptyTask ? task : null))
  );

  onContainerClick(e: Event) {
    if (e.target === e.currentTarget) {
      this.selectedTask$.pipe(take(1)).subscribe((task) => {
        if (task) {
        }
      });
    }
  }
}
