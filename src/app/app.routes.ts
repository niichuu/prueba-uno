import { Routes } from '@angular/router';
import { AdminComponent } from './components/admin/admin.component';
import { ContestantComponent } from './components/contestant/contestant.component';
import { RankingComponent } from './components/ranking/ranking.component';

export const routes: Routes = [
  { path: '', redirectTo: '/admin', pathMatch: 'full' },
  { path: 'admin', component: AdminComponent },
  { path: 'contestant', component: ContestantComponent },
  { path: 'ranking', component: RankingComponent },
  { path: '**', redirectTo: '/admin' }
];
