import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, output, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DragManager } from '../services/drag-manager';
import { TimelineSlot, STATE } from '../timeline-slot/timeline-slot'
import { RunConfig } from '../../generated/api/model/runConfig';
import { SemConfig } from '../../generated/api';
import { CourseList } from '../course-list/course-list';
import { CourseInfoService } from '../services/course-info';

export enum OVERLAY_STATUS {
  OFF,
  LOADING,
  ERROR
}

const SLOTS_PER_SEMESTER = 6;
const INITIAL_SEMESTER_COUNT = 8;
const MIN_ALWAYS_ENABLED = 6; // Sem 1-6 can never be disabled or removed
const MAX_SEMESTER_COUNT = 10;
const ABSTRACT_DEFAULT_CREDITS = 3; // abstract_ courses aren't in the catalog, so they don't have a real credit value

@Component({
  selector: 'app-timeline',
  imports: [TimelineSlot, CommonModule],
  templateUrl: './timeline.html',
  styleUrl: './timeline.css'
})
export class Timeline implements OnInit, OnDestroy {

  semesterCount: number = INITIAL_SEMESTER_COUNT;

  courseVal: (string | null)[][] = Array.from({ length: INITIAL_SEMESTER_COUNT }, () => Array(SLOTS_PER_SEMESTER).fill(null));
  stateVals: STATE[][] = Array.from({ length: INITIAL_SEMESTER_COUNT }, () => Array(SLOTS_PER_SEMESTER).fill(STATE.ENABLED))

  semesterCredits: number[] = Array.from({ length: INITIAL_SEMESTER_COUNT }, () => 0);
  totalCredits: number = 0;

  @Output() dropCourse: EventEmitter<string> = new EventEmitter<string>();

  @ViewChildren('timelineSlot') timelineSlots !: QueryList<TimelineSlot>;

  readonly OVERLAY_STATUS = OVERLAY_STATUS;
  overlayStatus: OVERLAY_STATUS = OVERLAY_STATUS.OFF;

  private courseLoadedSub?: Subscription;

  constructor(private courseInfo: CourseInfoService) {}

  ngOnInit(): void {
    // Credits are only summed from what's already cached (see updateCredits);
    // this keeps the total in sync as hovers - or the bulk preload below -
    // populate the cache, without updateCredits itself ever triggering a fetch.
    this.courseLoadedSub = this.courseInfo.loaded$.subscribe(() => this.updateCredits());
    // One bulk catalog fetch instead of a per-course burst on every schedule change.
    this.courseInfo.preloadAll();
  }

  ngOnDestroy(): void {
    this.courseLoadedSub?.unsubscribe();
  }

  range(val: number) {
    return Array.from({ length: val }, (_, i) => i);
  }

  readonly maxSemesterCount = MAX_SEMESTER_COUNT;

  addSemester(): void {
    if (this.semesterCount >= MAX_SEMESTER_COUNT) {
      return;
    }
    this.courseVal.push(Array(SLOTS_PER_SEMESTER).fill(null));
    this.stateVals.push(Array(SLOTS_PER_SEMESTER).fill(STATE.ENABLED));
    this.semesterCredits.push(0);
    this.semesterCount++;
    this.updateCredits();
  }

  removeSemester(): void {
    if (this.semesterCount <= INITIAL_SEMESTER_COUNT) {
      return;
    }
    this.courseVal.pop();
    this.stateVals.pop();
    this.semesterCredits.pop();
    this.semesterCount--;
    this.updateCredits();
  }

  toggleSemesterDisabled(i: number): void {
    const disabling = !this.isSemesterDisabled(i);
    for (let j = 0; j < SLOTS_PER_SEMESTER; j++) {
      this.stateVals[i][j] = disabling ? STATE.DISABLED : STATE.ENABLED;
    }
    const slots = this.timelineSlots?.toArray().slice(i * SLOTS_PER_SEMESTER, i * SLOTS_PER_SEMESTER + SLOTS_PER_SEMESTER) ?? [];
    slots.forEach(slot => disabling ? slot.disable() : slot.enable());
  }

  isSemesterDisabled(i: number): boolean {
    return this.stateVals[i].every(state => state == STATE.DISABLED);
  }

  // Semesters added past the original 8 can be deleted outright (only the
  // trailing one, since removeSemester only ever pops the tail); the base
  // 8 can only ever be grayed out via toggleSemesterDisabled.
  canRemove(i: number): boolean {
    return i >= INITIAL_SEMESTER_COUNT && i === this.semesterCount - 1;
  }

  canDisable(i: number): boolean {
    return i >= MIN_ALWAYS_ENABLED;
  }

  onHeaderIconClick(i: number): void {
    if (this.canRemove(i)) {
      this.removeSemester();
    } else {
      this.toggleSemesterDisabled(i);
    }
  }

  highlightCourse(course: string): void {
    this.timelineSlots?.forEach(slot => {
      if (slot.course === course) {
        slot.triggerGlow();
      }
    });
  }

  getPathway(): SemConfig[] {
    let semConfigs: SemConfig[] = [];
    for (let i = 0; i < this.semesterCount; i++) {
      // console.log(this.getSemester(i))
      semConfigs.push(this.getSemester(i))
    }
    return semConfigs;

  }

  getSemester(i: number): SemConfig {
    return {
      courses: this.courseVal[i].filter(course => course != null).filter(course => course != ""),
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
    this.updateCredits();
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
    this.updateCredits();
  }

  populateSemester(semesterIdx: number, courses: string[]){
    let courseIdx = 0;
    console.log(courses)

    let coursesFiltered = courses.filter(course => !this.courseVal[semesterIdx].includes(course))
    console.log(coursesFiltered)
    for(let slotIdx = 0; slotIdx < SLOTS_PER_SEMESTER; slotIdx ++){
      // console.log("state at: " + semesterIdx + ", " + slotIdx+ " " + this.stateVals[semesterIdx][slotIdx])
      // console.log("value at: " + semesterIdx + ", " + slotIdx+ " " + this.courseVal[semesterIdx][slotIdx])

      if (this.stateVals[semesterIdx][slotIdx] == STATE.DISABLED || this.stateVals[semesterIdx][slotIdx] == STATE.FILLED){
        console.log('skipping '  + semesterIdx + ", " + slotIdx+ " with: " + this.stateVals[semesterIdx][slotIdx])
        continue
      }
      else{
        console.log("populating " + semesterIdx + ", " + slotIdx+ " with: " + coursesFiltered[courseIdx])
        this.timelineSlots.get(semesterIdx*SLOTS_PER_SEMESTER+slotIdx)?.setCourseHelper(coursesFiltered[courseIdx])
        courseIdx++
      }
      if(courseIdx == coursesFiltered.length){
        break
      }

    }
  }

  setOverlay(status: OVERLAY_STATUS, message: string | null){
    this.overlayStatus = status;
  }

  reset(){
    this.timelineSlots.forEach(
      courseSlot => {
        courseSlot.clear();
        console.log(courseSlot.stateValue)
      }
    )
    this.overlayStatus = OVERLAY_STATUS.OFF;
    console.log(this.stateVals)
    this.updateCredits();
  }

  // Sums credits from whatever's already in CourseInfoService's cache -
  // never triggers a fetch itself. A course only contributes once it's been
  // hovered somewhere (tooltip lookups populate the cache), at which point
  // loaded$ (subscribed in ngOnInit) re-runs this and the total catches up.
  updateCredits(): void {
    this.semesterCredits = this.courseVal.map(semester => {
      const codes = semester.filter((c): c is string => !!c);
      return codes.reduce((sum, code) => sum + this.creditsFor(code), 0);
    });
    this.totalCredits = this.semesterCredits.reduce((sum, credits) => sum + credits, 0);
  }

  private creditsFor(code: string): number {
    if (code.startsWith('abstract_')) {
      return ABSTRACT_DEFAULT_CREDITS;
    }
    return this.courseInfo.getCachedCourse(code)?.credits ?? 0;
  }

}
