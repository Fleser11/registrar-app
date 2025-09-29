import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineSlot } from './timeline-slot';

describe('TimelineSlot', () => {
  let component: TimelineSlot;
  let fixture: ComponentFixture<TimelineSlot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineSlot]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimelineSlot);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
