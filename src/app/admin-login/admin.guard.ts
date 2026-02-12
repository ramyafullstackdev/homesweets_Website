import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';

  if (!isAdminLoggedIn) {
    router.navigate(['/admin-login']);
    return false;
  }
  return true;
};