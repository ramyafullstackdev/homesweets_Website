import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SocialAuthService, SocialUser } from 'angularx-social-login';
import { map, tap } from 'rxjs';
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
    const socialAuthService = inject(SocialAuthService);

  return socialAuthService.authState.pipe(
    map((socialUser: SocialUser) => !!socialUser),
    tap((isLoggedIn: boolean) => {
      if (!isLoggedIn) {
        router.navigate(['home']);
      }
    })
  );
  // const authService = inject(AuthService);
  // if (authService.isLoggedIn()) {
  //   return true;
  // } else {
  //   // router.navigateByUrl('/test-login');
  //   return false;
  // }
};
