import { Component, ElementRef, EventEmitter, Output, output, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragManager } from '../services/drag-manager';
import { TimelineSlot, STATE } from '../timeline-slot/timeline-slot'
import { RunConfig } from '../../generated/api/model/runConfig';
import { SemConfig } from '../../generated/api';
import { CourseList } from '../course-list/course-list';

@Component({
  selector: 'app-timeline',
  imports: [TimelineSlot, CommonModule],
  templateUrl: './timeline.html',
  styleUrl: './timeline.css'
})
export class Timeline {

  courseVal: (string | null)[][] = Array.from({ length: 8 }, () => Array(6).fill(null));
  stateVals: STATE[][] = Array.from({ length: 8 }, () => Array(6).fill(STATE.ENABLED))

  @Output() dropCourse: EventEmitter<string> = new EventEmitter<string>();

  @ViewChildren('timelineSlot') timelineSlots !: QueryList<TimelineSlot>;



  range(val: number) {
    return Array.from({ length: val }, (_, i) => i);
  }

  getPathway(): SemConfig[] {
    let semConfigs: SemConfig[] = [];
    for (let i = 0; i < 8; i++) {
      // console.log(this.getSemester(i))
      semConfigs.push(this.getSemester(i))
    }
    return semConfigs;

  }

  getSemester(i: number): SemConfig {
    return {
      courses: this.courseVal[i].filter(course => course != null),
      numCourses: this.stateVals[i].filter(state => {
        console.log(state)
        return state != STATE.DISABLED
      }).length
    }
  }


  getCourses(): (string | null)[][] | null {
    console.log(this.courseVal)
    return this.courseVal;

  }

  setCourse(data: string | null, i: number, j: number) {
    this.courseVal[i][j] = data
  }

  setState(state: STATE, i: number, j: number) {
    this.stateVals[i][j] = state
    console.log(this.stateVals[i][j] + " " + state)
    // console.log("state vals: " + this.stateVals)
    // console.log("setting state of " + i + "," + j + " to " + state)
  }

  currentCourse(i: number, j: number) {
    return this.courseVal[i][j] ? this.courseVal[i][j] : "";
  }

  resetCourse(course: string | null) {
    if (course != null) {
      this.dropCourse.emit(course)
    }
  }

  lockTimeline(status: boolean) {
    console.log("lock timeline")
    this.timelineSlots.forEach(
      slot => {
        slot.locked = status;
        slot.stateLocked = status;
      }

    )
    this.timelineSlots.forEach(
      slot => console.log(slot.locked)
    )
  }

  populateTimeline(courses: string[][]){
    courses.forEach(
      (semester, i) => {
        this.populateSemester(i, semester);
      }
    )
  }

  populateSemester(semesterIdx: number, courses: string[]){
    let courseIdx = 0;
    console.log(courses)
    
    let coursesFiltered = courses.filter(course => !this.courseVal[semesterIdx].includes(course))
    console.log(coursesFiltered)
    for(let slotIdx = 0; slotIdx < 6; slotIdx ++){
      // console.log("state at: " + semesterIdx + ", " + slotIdx+ " " + this.stateVals[semesterIdx][slotIdx])
      // console.log("value at: " + semesterIdx + ", " + slotIdx+ " " + this.courseVal[semesterIdx][slotIdx])

      if (this.stateVals[semesterIdx][slotIdx] == STATE.DISABLED || this.stateVals[semesterIdx][slotIdx] == STATE.FILLED){
        console.log('skipping '  + semesterIdx + ", " + slotIdx+ " with: " + this.stateVals[semesterIdx][slotIdx])
        continue
      }
      else{
        console.log("populating " + semesterIdx + ", " + slotIdx+ " with: " + coursesFiltered[courseIdx])
        this.timelineSlots.get(semesterIdx*6+slotIdx)?.setCourseHelper(coursesFiltered[courseIdx])
        courseIdx++
      }
      if(courseIdx == coursesFiltered.length){
        break
      }
      
    }
  }

  reset(){
    this.timelineSlots.forEach(
      courseSlot => {
        courseSlot.clear();
        console.log(courseSlot.stateValue)
      }
    )
    console.log(this.stateVals)
  }

}
