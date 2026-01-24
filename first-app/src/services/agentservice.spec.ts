import { TestBed } from '@angular/core/testing';

import { Agentservice } from './agentservice';

describe('Agentservice', () => {
  let service: Agentservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Agentservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
