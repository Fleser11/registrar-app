import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunButton } from './run-button';

describe('RunButton', () => {
  let component: RunButton;
  let fixture: ComponentFixture<RunButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RunButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RunButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
