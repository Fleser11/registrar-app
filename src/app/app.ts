import { Component, signal, OnInit, ViewChild, ViewEncapsulation, ComponentFactoryResolver } from '@angular/core';
import { CommonModule } from '@angular/common';


import { FormsModule } from '@angular/forms';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';

import { AuditSelector } from './audit-selector/audit-selector';
import { Timeline } from './timeline/timeline';
import { SubAuditList } from './sub-audit-list/sub-audit-list';
import { RunButton } from './run-button/run-button';
import { CourseList } from './course-list/course-list';

import { DefaultService } from '../generated/api/api/default.service';
import { Audit } from '../generated/api';
import { SubAudit } from '../generated/api';
import { RunConfig } from '../generated/api';
import { Course } from '../generated/api';
import { ClearButton } from './clear-button/clear-button';

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
    DialogModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {

  audits: string[] = []
  genEds: string[] = []
  courses: string[] = []

  failed=false;
  errorMessage = "";

  loading: boolean = false;

  audit: Audit | undefined;
  genEdAudit: Audit | undefined;

  auditSelectorIsVisible = true;
  
  subAudits: SubAudit[] = [];


  @ViewChild('timeline') timeline!: Timeline;
  @ViewChild('courseList') courseList!: CourseList;

  private defaultService: DefaultService;
  constructor(service: DefaultService) {
    this.defaultService = service;
  }

  setAudit(audit: string){
    this.defaultService.auditsAuditGet(audit).subscribe(
      (data) => {
        this.audit = data;
        this.updateCourseList();
      }
    );
  }

  setGenEd(audit: string){
    this.defaultService.auditsAuditGet(audit).subscribe(
      (data) => {
        this.genEdAudit = data;
        this.updateCourseList();
      }
    );
  }

  updateCourseList() {
    this.courses = this.getCourses();
    //console.log(this.courseList);
  }

  parseCourses(str: string): string[]{
    // Handle abstract courses
    if(str.startsWith("abstract_")){
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

  getCourses(): string[] {
    if (!this.audit?.subAudit) {
      return [];
    }
    return this.audit.subAudit.flatMap(subAudit => 
      subAudit.courses ? subAudit.courses.flatMap(course => this.parseCourses(course)) : []
    );
  }

  format(str: string): string{
    var match: RegExp = new RegExp("(abstract_)?(.*)")
    var arr = match.exec(str)
    //console.log(arr)
    // if (arr)
    //   //console.log(arr);
    if (!arr || arr.length < 3) {
      return "app_" + str + "unparsable";
    }
    return (arr[1]?arr[1].toString():"").concat(arr[2].toString());
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

  clearCourseVal(): void{
    this.timeline.reset()
    this.courseList.resetVisibility();
  }

  runCourseVal(): void {
    //console.log(this.timeline.getCourses());

    this.loading = true;
    this.failed=false
    this.timeline.lockTimeline(true);



    let pathway = this.timeline.getPathway()
    var config: RunConfig = {
      genEdProgram: "GenEd",
      pathway: pathway
    }

    //console.log("config")
    //console.log(config)
    if (this.audit?.info === undefined){
      this.failed=true
      this.loading=false
      this.errorMessage = "No audit selected"
      this.timeline.lockTimeline(false);
      return
    }
    this.defaultService.auditsAuditRunPost(this.audit["info"].code, config).subscribe(
      {next: data=>{
        //console.log(data)
        this.loading=false
        let timelineRet =[... data.map((semConfig) => {
          return semConfig.courses? semConfig.courses.map(course => 
            {
              let courseFormatted = this.format(course)
              this.courseList.setVisible(course, false)
              return courseFormatted
            }) : []
        })]
        this.timeline.populateTimeline(timelineRet)
        this.timeline.lockTimeline(false);
      },
      error: err=>{
        this.failed=true
        this.loading=false
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
          if(audit.info?.isGenEd == false && audit.info?.code){
            tempAudits.push(audit.info.code);
          } else if (audit.info?.isGenEd == true && audit.info?.code){
            tempGenEds.push(audit.info.code);
          }
        });
        
        this.audits = tempAudits;
        this.genEds = tempGenEds;
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

  dropCourse(course: string): void{
    //console.log("setting course visible")
    this.courseList.setVisible(course, true)
  }
}
