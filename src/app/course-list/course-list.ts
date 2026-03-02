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


  matchesSearch(course: string): boolean{
    return course.includes(this.searchTerm);

  }

}

