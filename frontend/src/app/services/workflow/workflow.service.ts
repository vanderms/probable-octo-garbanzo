import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WorkflowFactory } from 'src/app/util/functions/workflow.fn';
import { WorkflowTask } from 'src/app/util/types/task.type';
import { Workflow } from 'src/app/util/types/workflow.type';

@Injectable({
  providedIn: 'root',
})
export class WorkflowService {
  constructor(private http: HttpClient) {}

  current$ = new BehaviorSubject<null | Workflow>(null);

  createWorkflow(task: WorkflowTask) {
    const next = WorkflowFactory.empty();
    next.tasks.push(task);
    this.current$.next(next);
  }
}
