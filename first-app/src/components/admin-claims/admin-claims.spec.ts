import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminClaim } from './admin-claims';

describe('AdminClaims', () => {
  let component: AdminClaim;
  let fixture: ComponentFixture<AdminClaim>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminClaim]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminClaim);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
