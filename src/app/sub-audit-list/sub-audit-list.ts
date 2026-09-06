import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { SubAudit } from '../../generated/api';
import { CommonModule } from '@angular/common';
import { DragManager } from '../services/drag-manager';
import { atomicTokens, isSubAuditSatisfied } from '../services/audit-utils';
import { CourseInfoService } from '../services/course-info';


@Component({
  selector: 'app-sub-audit-list',
  imports: [CommonModule],
  templateUrl: './sub-audit-list.html',
  styleUrl: './sub-audit-list.css',
  standalone: true
})
export class SubAuditList implements OnInit {
  courses: string[] = [];

  constructor(private courseInfo: CourseInfoService) {}

  ngOnInit(): void {
    if (this.subAudit.courses) {
      this.courses = this.subAudit.courses;
    }
  }

  @Input() subAudit!: SubAudit;
  @Input() placedCourses: string[] = [];
  @Output() courseClick = new EventEmitter<string>();

  @HostBinding('class.satisfied')
  get satisfied(): boolean {
    return isSubAuditSatisfied(this.subAudit ?? {}, this.placedCourses);
  }

  // The atomic course/abstract identifiers referenced across all of this
  // sub-audit's requirement entries, flattened for display as clickable chips.
  get displayCourses(): string[] {
    if (!this.subAudit?.courses) {
      return [];
    }
    const seen = new Set<string>();
    const result: string[] = [];
    for (const entry of this.subAudit.courses) {
      for (const tok of atomicTokens(entry)) {
        if (!seen.has(tok)) {
          seen.add(tok);
          result.push(tok);
        }
      }
    }
    return result;
  }

  isCoursePlaced(course: string): boolean {
    return this.placedCourses.includes(course);
  }

  // Display-only label: strips the abstract_ prefix and decodes %20, same
  // convention used by the timeline/course-list/transfer-page bubbles.
  displayLabel(course: string): string {
    const stripped = course.startsWith('abstract_') ? course.slice('abstract_'.length) : course;
    return this.courseInfo.displayLabel(stripped);
  }

  onDragStart(event: any, data: any): void{
    var idx = this.courses.indexOf(data)
    this.courses.splice(idx, 1);
    DragManager.setCurrentItem(data);
  }
}
