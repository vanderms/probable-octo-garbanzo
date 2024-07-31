import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Direction } from 'src/app/util/types/directions';

@Injectable({
  providedIn: 'root',
})
export class ControlService {
  direction$ = new BehaviorSubject<Direction>(Direction.NONE);

  setDirection(direction: Direction) {
    this.direction$.next(direction);
  }

  getDirection() {
    return this.direction$;
  }
}
