import { Component, Input } from '@angular/core';
import { Draggable } from '../services/drag-manager'


@Component({
  selector: 'app-course-list-item',
  imports: [],
  templateUrl: './course-list-item.html',
  styleUrl: './course-list-item.css'
})
export class CourseListItem extends Draggable{
  @Input() course: string = "";

  onDrop(){
    
  }
}
