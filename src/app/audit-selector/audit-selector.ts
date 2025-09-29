import { Component, Input } from '@angular/core';

import { ListboxModule } from 'primeng/listbox';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-audit-selector',
  imports: [ListboxModule, FormsModule],
  templateUrl: './audit-selector.html',
  styleUrl: './audit-selector.css'
})
export class AuditSelector {

  @Input() audits: string[] = [];
  @Input() genEds: string[] = [];
  @Input() selectAudit!: (audit: string) => void;
  @Input() selectGenEd!: (genEd: string) => void;


  onAuditChange(event: any): void {
    console.log(event.value)
    this.selectAudit(event.value);
  }
  onSubAuditChange(event: any): void {
    this.selectGenEd(event.value);
  }
}
