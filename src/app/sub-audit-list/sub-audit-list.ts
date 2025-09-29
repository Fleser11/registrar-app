import { Component, Input, OnInit } from '@angular/core';
import { SubAudit } from '../../generated/api';
import { CommonModule } from '@angular/common';
import { DragManager } from '../services/drag-manager';


@Component({
  selector: 'app-sub-audit-list',
  imports: [CommonModule],
  templateUrl: './sub-audit-list.html',
  styleUrl: './sub-audit-list.css',
  standalone: true
})
export class SubAuditList implements OnInit {
  courses: string[] = [];
  ngOnInit(): void {
    if (this.subAudit.courses) {
      this.courses = this.subAudit.courses;
    }
  }

  @Input() subAudit!: SubAudit;



  onDragStart(event: any, data: any): void{
    var idx = this.courses.indexOf(data)
    this.courses.splice(idx, 1);
    DragManager.setCurrentItem(data);
  }
}
