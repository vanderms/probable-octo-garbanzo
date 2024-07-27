import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-application-bar',
  templateUrl: './application-bar.component.html',
  styleUrls: ['./application-bar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationBarComponent {
  constructor() {}
}
