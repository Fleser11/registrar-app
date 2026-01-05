import { Component, ElementRef, EventEmitter, HostBinding, Input, Output, ViewChild, ViewChildren } from '@angular/core';
import { Draggable, DragManager } from '../services/drag-manager';
import { DragDropModule } from 'primeng/dragdrop';
import { CommonModule } from '@angular/common';
import { delay } from 'rxjs';


export enum STATE{
  ENABLED,
  DISABLED,
  FILLED
}

@Component({
  selector: 'app-timeline-slot',
  imports: [DragDropModule, CommonModule],
  templateUrl: './timeline-slot.html',
  styleUrl: './timeline-slot.css'
})
export class TimelineSlot extends Draggable {
  readonly STATE = STATE;

  @Output() setCourse = new EventEmitter<string | null>;
  @Output() setState = new EventEmitter<STATE>;
  @Output() resetCourse = new EventEmitter<string | null>;
  @Input() course: string | null = "";

  @ViewChild('courseDiv') courseDiv !: ElementRef;

  stateLocked: boolean = false;

  stateValue: STATE = STATE.ENABLED;
  get state(): STATE {
    return this.stateValue ;
  }

  set state(value: STATE) {
    this.stateValue = value;
  }


  hasValue(): boolean {
    return this.course !== null && this.course !== "";
  }

  setCourseHelper(course: string){
    this.setCourse.emit(course);
    console.log("setting state to filled")
    this.setState.emit(STATE.FILLED)
    this.state = STATE.FILLED
  }

  onDrop(event: any): any{
    this.setCourseHelper(DragManager.getCurrentItem().data)
    // this.course = DragManager.getCurrentItem().data
    //console.log("dropped current item: " + this.course)
    DragManager.setCurrentItem(null);
    DragManager.success = true;
    console.log("setting state to filled")
    this.setState.emit(STATE.FILLED)
    this.state = STATE.FILLED
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
    return arr && arr[2] ? arr[2].toString() : "timeline_" + str + "unparsable";
  }

  coursef(course: string | null): string{
    if (course){
      return this.format(course);
    }
    return "";
  }

  ngOnChanges() {
    //console.log("Course input changed:", this.course);
    if (this.courseDiv) {
      this.courseDiv.nativeElement.style.cursor = this.hasValue() ? 'grab' : 'default';
      this.locked = this.hasValue();
    }
  }

  override onDragStart(event: any, data: any){
    this.setCourse.emit(null);
    // this.course = ""
    this.locked = false;
    super.onDragStart(event, data)
  }

  override onDragEnd(event: any): void{
    if (!DragManager.isSuccessful()){
      this.setCourse.emit(this.data);
      // this.course = this.data
    }
      
  }

  disable(): void{
    if(!this.stateLocked){
      this.state = STATE.DISABLED;
      this.locked = true;
      this.setState.emit(this.state);
    }
  }

  enable(): void{
    if(!this.stateLocked){
      this.state = STATE.ENABLED;
      this.locked = false;
      this.setState.emit(this.state);
    }
  }

  clear(): void{
    if(!this.stateLocked){
      this.resetCourse.emit(this.course)
      console.log("runnign clear")
      this.state = STATE.ENABLED
      this.setCourse.emit(null);
      console.log("runnign emit state: " + this.state)
      this.setState.emit(this.state);

    }
  }

}
