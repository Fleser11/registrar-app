import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { CourseInfoService } from '../services/course-info';
import { ShrinkToFit } from '../services/shrink-to-fit';

@Component({
  selector: 'app-transfer-page-course',
  imports: [ShrinkToFit],
  templateUrl: './transfer-page-course.html',
  styleUrl: './transfer-page-course.css'
})
export class TransferPageCourse {

  @Input() course: string = "";

  @Output() clearCourse = new EventEmitter<void>();

  hoverTooltip: string = '';

  @HostBinding('class.glow') glowing = false;

  triggerGlow(): void {
    this.glowing = false;
    requestAnimationFrame(() => {
      this.glowing = true;
      setTimeout(() => this.glowing = false, 1000);
    });
  }

  constructor(private courseInfo: CourseInfoService) {}

  coursef(course: string){
    return this.courseInfo.displayLabel(course.replace("abstract_", ""));
  }

  updateTooltip(): void {
    if (!this.course) {
      this.hoverTooltip = '';
      return;
    }
    const label = this.coursef(this.course);
    this.hoverTooltip = label;
    if (this.course.startsWith('abstract_')) {
      return;
    }
    this.courseInfo.getCourse(this.course).subscribe(info => {
      if (info) {
        this.hoverTooltip = this.courseInfo.describe(info) || label;
      }
    });
  }

  clear(): void {
    this.clearCourse.emit();
    console.log("clearing course: " + this.course);
  }
}
