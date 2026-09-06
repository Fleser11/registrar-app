import { Directive, ElementRef, HostListener, AfterViewChecked } from '@angular/core';

const MIN_FONT_EM = 0.5;
const STEP_EM = 0.05;
const BASE_FONT_EM = 1;

@Directive({
  selector: '[appShrinkToFit]',
  standalone: true
})
export class ShrinkToFit implements AfterViewChecked {

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewChecked(): void {
    this.shrink();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.shrink();
  }

  shrink(): void {
    const label = this.el.nativeElement;
    const container = label.parentElement;
    if (!label || !container) {
      return;
    }
    let fontSize = BASE_FONT_EM;
    label.style.fontSize = fontSize + 'em';
    while (label.scrollWidth > container.clientWidth && fontSize > MIN_FONT_EM) {
      fontSize = Math.max(MIN_FONT_EM, fontSize - STEP_EM);
      label.style.fontSize = fontSize + 'em';
    }
  }
}
