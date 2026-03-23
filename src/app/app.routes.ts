import { Routes } from '@angular/router';
import { TaskListComponent } from './pages/task-list/task-list';
import { TaskDetailComponent } from './pages/task-detail/task-detail';
import { UserListComponent } from './pages/user-list/user-list';

export const routes: Routes = [
    { path: '', redirectTo: 'tasks', pathMatch: 'full' },
    { path: 'tasks', component: TaskListComponent },
    { path: 'tasks/:id', component: TaskDetailComponent },
    { path: 'users', component: UserListComponent },
    { path: '**', redirectTo: 'tasks' }
];