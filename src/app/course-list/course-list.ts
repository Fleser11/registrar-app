import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Course } from '../../generated/api';
import { DragManager } from '../services/drag-manager';
import { CourseListItem } from '../course-list-item/course-list-item';

@Component({
  selector: 'app-course-list',
  imports: [
    CommonModule,
    CourseListItem
  ],
  templateUrl: './course-list.html',
  styleUrl: './course-list.css'
})
export class CourseList {
  @Input() courses: string[] = [];


    onDragStart(event: any, data: any): void{
      var idx = this.courses.indexOf(data)
      this.courses.splice(idx, 1);
      DragManager.setCurrentItem(data);
    }
}

