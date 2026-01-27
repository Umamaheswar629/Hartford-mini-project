import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnquiryManagement } from './enquiry-management';

describe('EnquiryManagement', () => {
  let component: EnquiryManagement;
  let fixture: ComponentFixture<EnquiryManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnquiryManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnquiryManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
