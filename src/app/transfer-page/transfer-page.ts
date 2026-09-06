import { Component, EventEmitter, Output, QueryList, ViewChildren } from '@angular/core';
import { Draggable, DragManager } from '../services/drag-manager';
import { CommonModule } from '@angular/common';
import { TransferPageCourse } from '../transfer-page-course/transfer-page-course';

@Component({
  selector: 'app-transfer-page',
  imports: [
    CommonModule,
    TransferPageCourse
  ],
  templateUrl: './transfer-page.html',
  styleUrl: './transfer-page.css'
})
export class TransferPage extends Draggable{

  courses: string[] = [];

  @ViewChildren(TransferPageCourse) transferCourses !: QueryList<TransferPageCourse>;

  @Output() dropCourse = new EventEmitter<string>();

  highlightCourse(course: string): void {
    this.transferCourses?.forEach(item => {
      if (item.course === course) {
        item.triggerGlow();
      }
    });
  }

  override onDragEnd(event: any): void {
    throw new Error('Method not implemented.');
  }
  override onDrop(event: any) {
    this.courses = [...this.courses, DragManager.getCurrentItem().data];
    DragManager.setCurrentItem(null);
    DragManager.setSuccess(true);
  }

  getCourses(): string[]{
    return this.courses;
  }

  resetVisibility(): void{
    this.courses.forEach(course => this.dropCourse.emit(course));
    this.courses = [];
  }

  removeCourse(course: string): void{
    this.courses = this.courses.filter(c => c !== course);
    this.dropCourse.emit(course);
  }

}
