import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-clear-button',
  imports: [],
  templateUrl: './clear-button.html',
  styleUrl: './clear-button.css'
})
export class ClearButton {
  @Input() callback!: () => void;

  clear() {
    if (this.callback) {
      this.callback();
    } else {
      console.error('No callback function provided for run button.');
    }
  }
}
