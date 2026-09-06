import { Component, Input, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseListItem } from '../course-list-item/course-list-item';
import { SearchBar } from '../search-bar/search-bar';

@Component({
  selector: 'app-course-list',
  imports: [
    CommonModule,
    CourseListItem,
    SearchBar
  ],
  templateUrl: './course-list.html',
  styleUrl: './course-list.css'
})
export class CourseList {
  @Input() courses: string[] = [];
  @ViewChildren(CourseListItem) courseItems !: any;

  searchTerm: string = '';


  resetVisibility(): void {
    this.courseItems.forEach((item: CourseListItem) => {
      item.hidden = false;
    });
  }

  setVisible(course: string, visible: boolean){
    // console.log("set " + course + " to " + visible)
    this.courseItems.forEach((item: CourseListItem) => {
      if (item.course == course){
        item.hidden = !visible
      }
    });
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
  }

  // Used when a course is clicked elsewhere (e.g. a sub-audit chip): pulls it
  // up in the search box and glows the matching item so it's easy to spot.
  searchAndHighlight(course: string): void {
    this.searchTerm = course;
    setTimeout(() => {
      const items = this.courseItems.filter((item: CourseListItem) => item.course === course);
      const matches = items.length ? items : this.courseItems.filter((item: CourseListItem) => this.matchesSearch(item.course));
      matches.forEach((item: CourseListItem) => item.triggerGlow());
    });
  }


  matchesSearch(course: string): boolean{
    return course.toLowerCase().includes(this.searchTerm.toLowerCase());

  }

  subjectPrefix(course: string): string {
    const match = course.replace('abstract_', '').match(/^[A-Za-z]+/);
    return match ? match[0].toUpperCase() : course;
  }

  get sortedCourses(): string[] {
    return [...this.courses].sort((a, b) => {
      const prefixA = this.subjectPrefix(a);
      const prefixB = this.subjectPrefix(b);
      if (prefixA !== prefixB) {
        return prefixA.localeCompare(prefixB);
      }
      return a.replace('abstract_', '').localeCompare(b.replace('abstract_', ''));
    });
  }

}

