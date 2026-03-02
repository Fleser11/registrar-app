import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-transfer-page-course',
  imports: [],
  templateUrl: './transfer-page-course.html',
  styleUrl: './transfer-page-course.css'
})
export class TransferPageCourse {

  @Input() course: string = "";

  @Output() clearCourse = new EventEmitter<void>();

  coursef(course: string){
    return course.replace("abstract_", "");
  }

  clear(): void {
    this.clearCourse.emit();
    console.log("clearing course: " + this.course);
  }
}
