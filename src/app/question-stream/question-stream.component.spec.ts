import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionStreamComponent } from './question-stream.component';

describe('QuestionStreamComponent', () => {
  let component: QuestionStreamComponent;
  let fixture: ComponentFixture<QuestionStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionStreamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
