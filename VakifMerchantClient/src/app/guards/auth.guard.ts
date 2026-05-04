import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Tarayıcının hafızasında 'token' (anahtar) var mı diye bakıyoruz
  const token = localStorage.getItem('token');

  if (token) {
    // Anahtar varsa kapıyı aç (true dön)
    return true;
  } else {
    // Anahtar yoksa Login sayfasına geri fırlat ve kapıyı kapat (false dön)
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }
};
