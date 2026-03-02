import { Component, Input } from '@angular/core';

import { ListboxModule } from 'primeng/listbox';
import { FormsModule } from '@angular/forms';
import { Audit } from '../../generated/api';

@Component({
  selector: 'app-audit-selector',
  imports: [ListboxModule, FormsModule],
  templateUrl: './audit-selector.html',
  styleUrl: './audit-selector.css'
})
export class AuditSelector {

  @Input() audits: Audit[] = [];
  @Input() genEds: Audit[] = [];
  @Input() selectAudit!: (audit: string) => void;
  @Input() selectGenEd!: (genEd: string) => void;

  get f_audits(): string[]{
    let ret: string[] = [];
    this.audits.forEach(
      audit => {
        ret.push(audit.info?.code + " - " + audit.info?.program);
      }
    )
    return ret;
  }

  get f_genEds(): string[]{
    let ret: string[] = [];
    this.genEds.forEach(
      audit => {
        ret.push(audit.info?.code + " - " + audit.info?.program);
      }
    )
    return ret;
  }

  onAuditChange(event: any): void {
    this.selectAudit(event.value.match(/^([a-zA-Z0-9]+)\s\-/)[1]);
  }
  onSubAuditChange(event: any): void {
    this.selectGenEd(event.value.match(/^([a-zA-Z0-9]+)\s\-/)[1]);
  }
}
