import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-run-button',
  imports: [CommonModule],
  templateUrl: './run-button.html',
  styleUrl: './run-button.css'
})
export class RunButton {
  @Input() callback!: () => void;
  @Input() disabled = false;
  @Input() totalCredits = 0;

  run() {
    if (!this.disabled && this.callback) {
      this.callback();
    } else {
      console.error('No callback function provided for run button.');
    }
  }

}
