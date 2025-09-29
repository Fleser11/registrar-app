import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragManager } from '../services/drag-manager';
import { TimelineSlot } from '../timeline-slot/timeline-slot'

@Component({
  selector: 'app-timeline',
  imports: [TimelineSlot, CommonModule],
  templateUrl: './timeline.html',
  styleUrl: './timeline.css'
})
export class Timeline {

  courseVal: string[][] = Array.from({ length: 8 }, () => Array(6).fill(null));
  range(val: number){
    return Array.from({length: val}, (_, i) => i);
  }




  getCourses(): string[][] | null {
    console.log(this.courseVal)
    return this.courseVal;

  }

  setCourse(data: string, i: number, j: number){
    this.courseVal[i][j] = data
  }

  currentCourse(i: number, j:number){
    return this.courseVal[i][j]? this.courseVal[i][j]:"";
  }

}
