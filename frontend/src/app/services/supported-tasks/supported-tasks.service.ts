import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvironmentService } from '../environment/environment.service';
import { map, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SupportedTasksService {
  constructor(
    private http: HttpClient,
    private envService: EnvironmentService
  ) {}

  private url = () =>
    `${this.envService.getEnvironment().serverUrl}/schemas/tasks/supported`;

  private supportedTasks$ = this.http
    .get<{ taskTypes: string[] }>(this.url())
    .pipe(
      map(({ taskTypes }) => taskTypes),
      shareReplay({ bufferSize: 1, refCount: true })
    );

  getSupportedTasks() {
    return this.supportedTasks$;
  }
}
