import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvironmentService } from '../environment/environment.service';
import { SupportedTasks } from 'src/app/util/types/supported-tasks.type';
import { map, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SupportedTasksService {
  constructor(
    private http: HttpClient,
    private envService: EnvironmentService
  ) {}

  private supportedTasks$ = this.http
    .get<SupportedTasks>(
      `${this.envService.get().serverUrl}/schemas/tasks/supported`
    )
    .pipe(
      map(({ taskTypes }) => taskTypes),
      shareReplay({ bufferSize: 1, refCount: true })
    );

  getSupportedTasks() {
    return this.supportedTasks$;
  }
}
