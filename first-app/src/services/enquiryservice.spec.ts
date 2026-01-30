import { TestBed } from '@angular/core/testing';

import { Enquiryservice } from './enquiryservice';

describe('Enquiryservice', () => {
  let service: Enquiryservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Enquiryservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
