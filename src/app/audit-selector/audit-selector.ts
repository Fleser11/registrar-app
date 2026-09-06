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
  @Input() selectedGenEd = '';

  get selectedGenEdDisplay(): string {
    const audit = this.genEds.find(item => item.info?.code === this.selectedGenEd);
    return audit?.info?.code && audit.info.program
      ? audit.info.code + ' - ' + audit.info.program
      : '';
  }

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
    const match = typeof event.value === 'string' ? event.value.match(/^([a-zA-Z0-9]+)\s\-/) : null;
    this.selectAudit(match ? match[1] : '');
  }
  onSubAuditChange(event: any): void {
    const match = typeof event.value === 'string' ? event.value.match(/^([a-zA-Z0-9]+)\s\-/) : null;
    this.selectGenEd(match ? match[1] : '');
  }
}
