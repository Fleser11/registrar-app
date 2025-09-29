import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-run-button',
  imports: [],
  templateUrl: './run-button.html',
  styleUrl: './run-button.css'
})
export class RunButton {
  @Input() callback!: () => void;

  run() {
    if (this.callback) {
      this.callback();
    } else {
      console.error('No callback function provided for run button.');
    }
  }

}
