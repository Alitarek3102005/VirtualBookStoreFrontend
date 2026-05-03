import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { addBookGuardGuard } from './add-book-guard-guard';

describe('addBookGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => addBookGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
