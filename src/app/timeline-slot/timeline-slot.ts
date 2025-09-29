import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Draggable, DragManager } from '../services/drag-manager';
import { DragDropModule } from 'primeng/dragdrop';


@Component({
  selector: 'app-timeline-slot',
  imports: [DragDropModule],
  templateUrl: './timeline-slot.html',
  styleUrl: './timeline-slot.css'
})
export class TimelineSlot extends Draggable {
  @Output() setCourse = new EventEmitter<string | null>;
  @Input() course: string | null = "";


  onDrop(event: any): any{
    this.setCourse.emit(DragManager.getCurrentItem().data);
    // this.course = DragManager.getCurrentItem().data
    console.log("dropped current item: " + this.course)
    this.locked = true;
    DragManager.setCurrentItem(null);
  }

  ngOnChanges() {
    console.log("Course input changed:", this.course);
  }

  override onDragStart(event: any, data: any){
    this.setCourse.emit(null);
    // this.course = ""
    this.locked = false;
    super.onDragStart(event, data)
  }

}
