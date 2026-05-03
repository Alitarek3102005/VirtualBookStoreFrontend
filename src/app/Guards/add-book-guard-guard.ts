import { inject, Injector } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../Services/auth-service';

export const addBookGuardGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router=inject(Router);
  const role:string|null =authService.getUserRole();
  if(role === "ADMIN"||role === "PUBLISHER") {
    return true;
  }
  router.navigate(["/"]);
  return false;
};
