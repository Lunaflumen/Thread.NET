import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { MainThreadComponent } from './components/main-thread/main-thread.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { NewPasswordComponent } from './components/new-password/new-password.component';
import { ResetPasswordGuard } from './guards/reset-password.guard';

export const AppRoutes: Routes = [
    { path: '', component: MainThreadComponent, pathMatch: 'full' },
    { path: 'thread', component: MainThreadComponent, pathMatch: 'full' },
    { path: 'profile', component: UserProfileComponent, pathMatch: 'full', canActivate: [AuthGuard] },
    { path: 'new-password', component: NewPasswordComponent, pathMatch: 'full', canActivate: [ResetPasswordGuard] },
    { path: '**', redirectTo: '' }
];
