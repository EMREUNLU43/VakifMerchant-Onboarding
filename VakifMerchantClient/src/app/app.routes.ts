import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { ApplicationListComponent } from './components/application-list/application-list';
import { authGuard } from './guards/auth.guard'; // 🚀 Bekçimizi sayfaya çağırdık

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // 🚀 canActivate: [authGuard] diyerek bu kapılara bekçiyi diktik
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'basvuru-listesi', component: ApplicationListComponent, canActivate: [authGuard] }
];
