import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Subject } from 'rxjs';
import { getOrThrow } from 'src/app/util/functions/get-or-throw.fn';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class DialogComponent {
  @ViewChild('dialog') _dialogRef?: ElementRef<HTMLDialogElement>;

  private dialog() {
    return getOrThrow(this._dialogRef).nativeElement;
  }

  close$ = new Subject<string>();

  onClose() {
    this.close$.next(this.dialog().returnValue);
  }

  showModal() {
    this.dialog().showModal();
    return this.close$;
  }
}
