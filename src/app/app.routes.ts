import { Routes } from '@angular/router';
import { NavbarComponent } from './Components/navbar-component/navbar-component';
import { AthenaArchiveComponent } from './Components/athena-archive-component/athena-archive-component';

export const routes: Routes = [
    {path: 'home', component: AthenaArchiveComponent},
    { path: '**', redirectTo: '/hero' }
];
