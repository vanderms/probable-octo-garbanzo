import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import {
  BehaviorSubject,
  combineLatest,
  map,
  of,
  startWith,
  take,
  tap,
} from 'rxjs';
import { TaskBuilderService } from 'src/app/services/task-builder/task-builder.service';
import { ToolbarService } from 'src/app/services/toolbar/toolbar.service';
import { WorkflowService } from 'src/app/services/workflow/workflow.service';
import { getOrThrow } from 'src/app/util/functions/get-or-throw.fn';

interface Point {
  x: number;
  y: number;
}

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

  @ViewChild('lines') _linesRef?: ElementRef<SVGElement>;

  getSVGLines() {
    return getOrThrow(this._linesRef).nativeElement;
  }

  cursor$ = new BehaviorSubject('');

  workflow$ = this.workflowService.getWorkflow().pipe(
    tap((workflow) => {
      if (workflow && workflow.tasks.length > 1) {
        const connections: Array<[Point, Point]> = [];

        for (let i = 1; i < workflow.tasks.length; i++) {
          const start = { ...workflow.tasks[i - 1].coordinates };
          start.y += 24;
          start.x += 120;
          const end = { ...workflow.tasks[i].coordinates };
          end.y += 24;
          end.x -= 6;

          connections.push([start, end]);
        }
        this.clearLines();
        connections.forEach((connection) => this.connectPoints(connection));
      }
    })
  );

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

  drawLine(points: Point[]) {
    const svg = this.getSVGLines();
    let pathData = `M${points[0].x} ${points[0].y}`;
    points.forEach((point, index) => {
      if (index > 0) {
        pathData += ` L${point.x} ${point.y}`;
      }
    });
    pathData +=
      ' L' + points[points.length - 1].x + ' ' + points[points.length - 1].y;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.setAttribute('d', pathData);
    line.setAttribute('stroke', 'var(--neutra-800)');
    line.setAttribute('stroke-width', '1');
    line.setAttribute('fill', 'none');
    line.setAttribute('marker-end', 'url(#arrowhead)');
    svg.appendChild(line);
  }

  connectPoints([start, end]: [Point, Point]): void {
    const offset = 12;

    if (end.x > start.x) {
      this.drawLine([start, end]);
    } else if (end.x <= start.x && end.y !== start.y) {
      this.drawLine([
        start,
        { x: start.x + offset, y: start.y },
        { x: end.x - offset, y: end.y },
        end,
      ]);
    } else if (end.x <= start.x && end.y === start.y) {
      this.drawLine([
        start,
        { x: start.x + offset, y: start.y },
        { x: start.x + offset, y: start.y - offset },
        { x: end.x - offset, y: end.y - offset },
        { x: end.x - offset, y: end.y },
        end,
      ]);
    }
  }

  clearLines(): void {
    const svg = this.getSVGLines();
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Se houver definições de marcadores (como a seta), reanexe-as.
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'marker'
    );
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '0');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');

    const polygon = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'polygon'
    );
    polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
    polygon.setAttribute('fill', 'black');

    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);
  }
}
