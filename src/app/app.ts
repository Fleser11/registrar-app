import { Component, signal, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';


import { ListboxModule } from 'primeng/listbox';
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

@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    ListboxModule,
    CommonModule,
    SubAuditList,
    Timeline,
    AuditSelector,
    RunButton,
    CourseList,
    ProgressBarModule,
    DialogModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {

  audits = ["SCS22022"]
  genEds = ["GenEd"]
  courses: Course[] = []
  courseList: string[] = []

  failed=false;
  errorMessage = "";

  loading: boolean = false;

  audit: Audit | undefined;
  genEdAudit: Audit | undefined;

  auditSelectorIsVisible = true;
  
  subAudits: SubAudit[] = [];


  @ViewChild('timeline') timeline!: Timeline;

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
    this.courseList = this.getCourses();
    console.log(this.courseList);
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
    
    console.log("parsed " + str + " into " + allMatches);
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
    var match: RegExp = new RegExp("(abstract_)?(.*)([\$])")
    var arr = match.exec(str)
    if (arr && arr[2]) {
      return arr[2];
    }
    console.log("unparsable: "+str)
    console.log(arr)
    if (arr)
      console.log(arr[2]);
    return arr && arr[2] ? arr[2].toString() : "null" + str + "unparsable";
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

  runCourseVal(): void {
    console.log(this.timeline.getCourses());

    this.loading = true;
    this.failed=false


    let pathway = this.timeline.getCourses()?.map(
      semester => {
        return {
          courses: semester.filter(course => {return (course != null)})
        }
      }
    )
    var config: RunConfig = {
      genEdProgram: "GenEd",
      pathway: pathway
    }
    this.defaultService.auditsAuditRunPost("SCS22022", config).subscribe(
      {next: data=>{
        console.log(data)
        this.loading=false
        this.timeline.courseVal=[... data.map((semConfig) => {
          return semConfig.courses? semConfig.courses.map(course => this.format(course)) : []
        })]
      },
      error: err=>{
        this.failed=true
        this.loading=false
        this.errorMessage = err.message
        console.log(err)
      }
    }
    )
  }

  course: string = "";
  ngOnInit() {
    // this.defaultService.coursesGet().subscribe(
    //   (data) => {
    //     this.courses = data;
    //   }
    // );
  }
}
