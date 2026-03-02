import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Draggable, DragManager } from '../services/drag-manager'


@Component({
  selector: 'app-course-list-item',
  imports: [CommonModule],
  templateUrl: './course-list-item.html',
  styleUrl: './course-list-item.css'
})
export class CourseListItem extends Draggable{

  @Input() course: string = "";
  @Input() visible: boolean = true;
  @Input() searchTerm: boolean = true;
  @Output() setVisibility = new EventEmitter<boolean>();

  @HostBinding('class.hidden') hidden = false;
  @HostBinding('class.no-match') get noMatch() {
    return !this.searchTerm;
  }

  format(str: string): string{
    var match: RegExp = new RegExp("(abstract_)?(.*)")
    var arr = match.exec(str)
    if (arr && arr[2]) {
      return arr[2];
    }
    //console.log("unparsable: "+str)
    //console.log(arr)
    // if (arr)
      //console.log(arr[2]);
    return arr && arr[2] ? arr[2].toString() : "null" + str + "unparsable";
  }

  coursef(course: string): string{
    if (course){
      return this.format(course);
    }
    return "";
  }
  onDrop(){
    // Do nothing  
  }

  override onDragStart(event: any, data: any): void{
    super.onDragStart(event, data);
    console.log(this.course)
    if(!this.course.includes("abstract_")){
      this.setVisibility.emit(false);
      this.hidden = true;

    }

    //console.log("drag started from course list item: " + this.course)

  }

  override onDragEnd(event: any): void{
    //console.log("drag ended for course list item: " + this.course);
    if (DragManager.isSuccessful() != true){
      // Restore the course if the drag was not successful
      //console.log("drag ended unsuccessfully for course list item: " + this.course);
      this.setVisibility.emit(true);
      this.hidden = false;
    }


  }

}
