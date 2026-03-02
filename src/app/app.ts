import { Component, signal, OnInit, ViewChild, ViewEncapsulation, ComponentFactoryResolver } from '@angular/core';
import { CommonModule } from '@angular/common';


import { FormsModule } from '@angular/forms';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';

import { Tab, Tabs, TabList, TabPanel, TabPanels } from 'primeng/tabs';

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
    ProgressBarModule,
    DialogModule,
    TransferPage
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

  loading: boolean = false;

  audit: Audit | undefined;
  genEdAudit: Audit | undefined;

  auditSelectorIsVisible = true;

  @ViewChild('timeline') timeline!: Timeline;
  @ViewChild('transferPage') transferPage!: TransferPage;
  @ViewChild('courseList') courseList!: CourseList;

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

  private defaultService: DefaultService;
  constructor(service: DefaultService) {
    this.defaultService = service;
  }

  setAudit(audit: string) {
    console.log("set audit!!")
    this.defaultService.auditsAuditGet(audit).subscribe(
      (data) => {
        this.audit = data;
        this.updateCourseList();
      }
    );
  }

  setGenEd(audit: string) {
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
    if (!this.audit?.subAudit && !this.audit?.subAudit) {
      this.courses = [];
    }
    else {
      this.courses = []
      if (this.audit)
        this.audit.subAudit.flatMap(subAudit =>
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

  clearCourseVal(): void {
    this.timeline.reset()
    this.transferPage.resetVisibility();
    this.courseList.resetVisibility();
  }

  runCourseVal(): void {
    this.loading = true;
    this.failed = false
    this.timeline.lockTimeline(true);

    let pathway = this.timeline.getPathway()
    console.log(this.transferPage)

    var config: RunConfig = {
      genEdProgram: "GenEd",
      pathway: { semesters: pathway },
      transferCourses: this.transferPage.getCourses()
    }
    if (this.audit?.info === undefined) {
      this.failed = true
      this.loading = false
      this.errorMessage = "No audit selected"
      this.timeline.lockTimeline(false);
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
              this.timeline.lockTimeline(false);
            }
          }
          else {
            this.failed = true
            this.errorMessage = "Unsolvable audit"
            this.timeline.lockTimeline(false);
          }
          this.loading = false
        },
        error: err => {
          this.failed = true
          this.loading = false
          this.errorMessage = err.message
          this.timeline.lockTimeline(false);
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
