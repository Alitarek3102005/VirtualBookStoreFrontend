import { CanActivateFn } from '@angular/router';

export const authGuardGuard: CanActivateFn = (route, state) => {
  if (localStorage.getItem('jwt_token')) {
    return true;
  } else {
    return false;
  }
};
