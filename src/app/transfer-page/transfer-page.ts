import { Component, EventEmitter, Output } from '@angular/core';
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

  @Output() dropCourse = new EventEmitter<string>();

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
    this.courses = [];
  }

  removeCourse(course: string): void{
    this.courses = this.courses.filter(c => c !== course);
    this.dropCourse.emit(course);
  }

}
