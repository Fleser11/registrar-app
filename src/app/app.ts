import { Component, signal, OnInit, ViewChild, ViewEncapsulation, ComponentFactoryResolver, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';


import { FormsModule } from '@angular/forms';

import { AuditSelector } from './audit-selector/audit-selector';
import { Timeline } from './timeline/timeline';
import { SubAuditList } from './sub-audit-list/sub-audit-list';
import { RunButton } from './run-button/run-button';
import { CourseList } from './course-list/course-list';

import { DefaultService } from '../generated/api/api/default.service';
import { Audit, UnsolvableError } from '../generated/api';
import { SubAudit } from '../generated/api';
import { RunConfig } from '../generated/api';
import { ClearButton } from './clear-button/clear-button';
import { TransferPage } from './transfer-page/transfer-page';
import { ExtraRestrictions } from './extra-restrictions/extra-restrictions';
import { Instructions } from './instructions/instructions';

import { OVERLAY_STATUS } from './timeline/timeline';
import { isSubAuditSatisfied } from './services/audit-utils';

@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    CommonModule,
    SubAuditList,
    Timeline,
    AuditSelector,
    RunButton,
    ClearButton,
    CourseList,
    TransferPage,
    ExtraRestrictions,
    Instructions
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {

  audits: Audit[] = []
  genEds: Audit[] = []
  courses: string[] = []

  failed = false;
  errorMessage = "";

  currentTab: string = 'timeline';
  menuTab: string = 'audits';

  loading: boolean = false;
  clearDialogVisible = false;
  clearMenuOpen = false;
  sidebarWidth = 10;
  workspaceHeight = 0;
  resizingSidebar = false;
  resizingWorkspace = false;

  audit: Audit | undefined;
  genEdAudit: Audit | undefined;

  auditSelectorIsVisible = true;

  @ViewChild('timeline') timeline!: Timeline;
  @ViewChild('transferPage') transferPage!: TransferPage;
  @ViewChild('courseList') courseList!: CourseList;
  @ViewChild('display') displayElement!: ElementRef<HTMLElement>;
  @ViewChild('right') rightElement!: ElementRef<HTMLElement>;

  get subAudits(): SubAudit[]{
    let tmpArr: SubAudit[] = [];

    if(this.audit){
      this.audit?.subAudit?.forEach(
        audit => {
          tmpArr.push(audit)
        }
      )
    }
    if(this.genEdAudit){
      this.genEdAudit?.subAudit?.forEach(
        audit => {
          tmpArr.push(audit)
        }
      )
    }

    return tmpArr;
  }

  get placedCourses(): string[] {
    const timelineCourses = this.timeline ? (this.timeline.getCourses() ?? []).flat() : [];
    const transferCourses = this.transferPage ? this.transferPage.getCourses() : [];
    return [...timelineCourses, ...transferCourses].filter((c): c is string => !!c);
  }

  // Satisfied requirements sort to the right so unmet ones stay up front.
  get sortedSubAudits(): SubAudit[] {
    const placed = this.placedCourses;
    return [...this.subAudits].sort((a, b) => {
      const aSatisfied = isSubAuditSatisfied(a, placed) ? 1 : 0;
      const bSatisfied = isSubAuditSatisfied(b, placed) ? 1 : 0;
      return aSatisfied - bSatisfied;
    });
  }

  onSubAuditCourseClick(course: string): void {
    this.courseList?.searchAndHighlight(course);
    this.timeline?.highlightCourse(course);
    this.transferPage?.highlightCourse(course);
  }

  private defaultService: DefaultService;
  constructor(service: DefaultService) {
    this.defaultService = service;
  }

  setAudit(audit: string) {
    if (!audit) {
      this.audit = undefined;
      this.updateCourseList();
      return;
    }
    console.log("set audit!!")
    this.defaultService.auditsAuditGet(audit).subscribe(
      (data) => {
        this.audit = data;
        this.updateCourseList();
      }
    );
  }

  setGenEd(audit: string) {
    if (!audit) {
      this.genEdAudit = undefined;
      this.updateCourseList();
      return;
    }
    this.defaultService.auditsAuditGet(audit).subscribe(
      (data) => {
        this.genEdAudit = data;
        this.updateCourseList();
      }
    );
  }




  parseCourses(str: string): string[] {
    // Handle abstract courses
    if (str.startsWith("abstract_")) {
      return [str];
    }

    // Handle regular course codes using the Java pattern: ([a-zA-Z][a-zA-Z]+[0-9]{4})(\\(C\\))?
    // This matches: letter + letters + 4 digits + optional (C)
    const coursePattern = /([a-zA-Z][a-zA-Z]+[0-9]{4})(\(C\))?/g;
    const allMatches: string[] = [];

    let match;
    while ((match = coursePattern.exec(str)) !== null) {
      // match[1] contains the course code without (C)
      allMatches.push(match[1]);
    }

    // If no matches found, handle complex expressions like "CS1131 or (CS1121 and CS1122)"
    if (allMatches.length === 0) {
      // Try a broader pattern for course codes in complex expressions
      const broadPattern = /[A-Z]{2,4}[0-9]{4}/g;
      let broadMatch;
      while ((broadMatch = broadPattern.exec(str)) !== null) {
        allMatches.push(broadMatch[0]);
      }

      // If still no matches, return the original string
      if (allMatches.length === 0) {
        allMatches.push(str);
      }
    }

    //console.log("parsed " + str + " into " + allMatches);
    return allMatches;
  }

  updateCourseList() {
    if (!this.audit?.subAudit && !this.genEdAudit?.subAudit) {
      this.courses = [];
    }
    else {
      this.courses = []
      if (this.audit)
        this.audit.subAudit?.flatMap(subAudit =>
          subAudit.courses ? subAudit.courses.flatMap(course => this.parseCourses(course)) : []
        ).forEach(c => this.courses.push(c));
      if (this.genEdAudit)
        this.genEdAudit?.subAudit?.flatMap(subAudit =>
          subAudit.courses ? subAudit.courses.flatMap(course => this.parseCourses(course)) : []
        ).forEach(c => this.courses.push(c));
    }
    //console.log(this.courseList);
  }



  format(str: string): string {
    var match: RegExp = new RegExp("(abstract_)?(.*)")
    var arr = match.exec(str)
    //console.log(arr)
    // if (arr)
    //   //console.log(arr);
    if (!arr || arr.length < 3) {
      return "app_" + str + "unparsable";
    }
    return (arr[1] ? arr[1].toString() : "").concat(arr[2].toString());
  }

  // Format course name (similar to Java formatCourseName method)
  formatCourseName(course: string): string {
    if (course.startsWith("abstract_")) {
      // Remove 'abstract_' prefix and format nicely
      return course.replace("abstract_", "").replace(/([A-Z])/g, ' $1').trim();
    }
    return course;
  }

  // Check if a course string contains logical operators (like the Java logic handles)
  isComplexCourseExpression(courseString: string): boolean {
    return courseString.includes(" or ") || courseString.includes(" and ") || courseString.includes("(");
  }

  closeAuditSelector(): void {
    this.auditSelectorIsVisible = false;
  }

  requestClearAll(): void {
    this.clearDialogVisible = true;
  }

  confirmClearAll(): void {
    this.clearDialogVisible = false;
    this.clearBoth();
  }

  clearBoth(): void {
    this.timeline.reset();
    this.transferPage.resetVisibility();
    this.courseList.resetVisibility();
    this.clearMenuOpen = false;
    this.failed = false;
  }

  finishRun(): void {
    this.loading = false;
    this.timeline.lockTimeline(false);
    this.timeline.setOverlay(OVERLAY_STATUS.OFF, null);
  }

  clearTimelineOnly(): void {
    this.timeline.reset();
    this.clearMenuOpen = false;
    this.failed = false;
  }

  clearTransferOnly(): void {
    this.transferPage.resetVisibility();
    this.clearMenuOpen = false;
  }

  resizeSidebar(event: PointerEvent): void {
    if (!this.resizingSidebar) {
      return;
    }
    const display = this.displayElement?.nativeElement;
    if (!display) {
      return;
    }
    const bounds = display.getBoundingClientRect();
    this.sidebarWidth = Math.min(35, Math.max(15, ((event.clientX - bounds.left) / bounds.width) * 100));
  }

  resizeWorkspace(event: PointerEvent): void {
    if (!this.resizingWorkspace) {
      return;
    }
    const right = this.rightElement?.nativeElement;
    if (!right) {
      return;
    }
    const bounds = right.getBoundingClientRect();
    this.workspaceHeight = Math.min(bounds.height * 0.75, Math.max(bounds.height * 0.25, event.clientY - bounds.top));
  }

  startSidebarResize(event: PointerEvent): void {
    this.resizingSidebar = true;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  stopSidebarResize(): void {
    this.resizingSidebar = false;
  }

  startWorkspaceResize(event: PointerEvent): void {
    this.resizingWorkspace = true;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  stopWorkspaceResize(): void {
    this.resizingWorkspace = false;
  }

  @HostListener('window:pointermove', ['$event'])
  onWindowPointerMove(event: PointerEvent): void {
    if (this.resizingWorkspace) {
      this.resizeWorkspace(event);
    } else if (this.resizingSidebar) {
      this.resizeSidebar(event);
    }
  }

  @HostListener('window:pointerup')
  stopResize(): void {
    this.resizingSidebar = false;
    this.resizingWorkspace = false;
  }

  runCourseVal(): void {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.timeline.setOverlay(OVERLAY_STATUS.LOADING, null);
    this.failed = false
    this.timeline.lockTimeline(true);

    let pathway = this.timeline.getPathway()
    console.log(this.transferPage)

    var config: RunConfig = {
      genEdProgram: this.genEdAudit?.info?.code ?? "GenEd",
      pathway: { semesters: pathway },
      transferCourses: this.transferPage.getCourses()
    }
    if (this.audit?.info === undefined) {
      this.failed = true
      this.errorMessage = "No audit selected"
      this.finishRun();
      return
    }
    this.defaultService.auditsAuditRunPost(this.audit["info"].code, config).subscribe(
      {
        next: data => {
          if ('semesters' in data && data.semesters) {

            if (data.semesters) {
              let timelineRet = [...data.semesters.map((semConfig) => {
                return semConfig.courses ? semConfig.courses.map(course => {
                  let courseFormatted = this.format(course)
                  this.courseList.setVisible(course, false)
                  return courseFormatted
                }) : []
              })]
              this.timeline.populateTimeline(timelineRet)
            }
          }
          else {
            this.failed = true
            this.errorMessage = "Unsolvable audit"
          }
          this.finishRun();
        },
        error: err => {
          this.failed = true
          this.errorMessage = err.message
          this.finishRun();
          //console.log(err)
        }
      }
    )
  }

  course: string = "";
  ngOnInit() {
    this.defaultService.auditsGet().subscribe(
      (data) => {
        const tempAudits: string[] = [];
        const tempGenEds: string[] = [];

        data.forEach(audit => {
          console.log(audit)
          if (audit.info?.isGenEd == false && audit.info?.code) {
            this.audits.push(audit);
          } else if (audit.info?.isGenEd == true && audit.info?.code) {
            this.genEds.push(audit);
          }
        });

        if (this.genEds.length > 0 && this.genEds[0].info?.code) {
          this.setGenEd(this.genEds[0].info.code);
        }

        // this.audits = tempAudits;
        // this.genEds = tempGenEds;
        // console.log(this.audits);
        // console.log(this.genEds);

      }
    );
    // this.defaultService.coursesGet().subscribe(
    //   (data) => {
    //     this.courses = data;
    //   }
    // );
  }

  dropCourse(course: string): void {
    //console.log("setting course visible")
    this.courseList.setVisible(course, true)
  }
}
