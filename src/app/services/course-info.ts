import { Injectable } from '@angular/core';
import { Observable, of, tap, catchError, Subject } from 'rxjs';
import { DefaultService } from '../../generated/api/api/default.service';
import { Course } from '../../generated/api';

@Injectable({
  providedIn: 'root'
})
export class CourseInfoService {

  private cache = new Map<string, Course | null>();

  // Emits a course code each time it's newly added to the cache (from any
  // caller - hover tooltips, credit totals, etc.) so listeners can react
  // without triggering their own fetch.
  readonly loaded$ = new Subject<string>();

  constructor(private api: DefaultService) {}

  // Synchronous cache peek: undefined = never fetched, null = fetched but
  // not found/failed, Course = fetched successfully. Never triggers a fetch.
  getCachedCourse(code: string): Course | null | undefined {
    return this.cache.get(code);
  }

  private preloadStarted = false;

  // Fetches the whole course catalog in one request and seeds the cache from
  // it, so per-course lookups (credits, tooltips) resolve instantly without
  // a burst of individual /courses/{code} calls. Safe to call repeatedly -
  // only the first call actually fetches.
  preloadAll(): void {
    if (this.preloadStarted) {
      return;
    }
    this.preloadStarted = true;
    this.api.coursesGet().subscribe({
      next: courses => {
        for (const course of courses) {
          if (course.code && !this.cache.has(course.code)) {
            this.cache.set(course.code, course);
          }
        }
        this.loaded$.next('*');
      },
      error: () => {
        this.preloadStarted = false;
      }
    });
  }

  getCourse(code: string): Observable<Course | null> {
    const cached = this.cache.get(code);
    if (cached !== undefined) {
      return of(cached);
    }
    return this.api.coursesCodeGet(code).pipe(
      tap(course => {
        this.cache.set(code, course);
        this.loaded$.next(code);
      }),
      catchError(() => {
        this.cache.set(code, null);
        this.loaded$.next(code);
        return of(null);
      })
    );
  }

  displayLabel(course: string): string {
    return course.replace(/%20/g, ' ');
  }

  describe(course: Course): string {
    const lines: string[] = [];
    const codeLabel = course.dept && course.number != null ? `${course.dept}${course.number}` : course.code;
    if (course.name) {
      lines.push(codeLabel ? `${codeLabel} — ${course.name}` : course.name);
    } else if (codeLabel) {
      lines.push(codeLabel);
    }
    if (course.credits != null) {
      lines.push(`${course.credits} credit${course.credits === 1 ? '' : 's'}`);
    }
    if (course.semester) {
      lines.push(`Semester: ${course.semester}`);
    }
    if (course.prereqs) {
      lines.push(`Prerequisites: ${course.prereqs}`);
    }
    if (course.description) {
      lines.push(course.description);
    }
    return lines.join('\n');
  }

}
