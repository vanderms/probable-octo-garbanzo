import { TestBed } from '@angular/core/testing';

import { SupportedTasksService } from './supported-tasks.service';

describe('SupportedTasksService', () => {
  let service: SupportedTasksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupportedTasksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
