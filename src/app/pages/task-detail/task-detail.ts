import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { Task } from '../../models/task.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './task-detail.html',
  styleUrl: './task-detail.css'
})
export class TaskDetailComponent implements OnInit {
  task: Task | null = null;
  users: User[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.userService.getAll().subscribe({
      next: (users) => {
        this.users = users;

        this.taskService.getById(id).subscribe({
          next: (task) => {
            this.task = task;
            this.loading = false;
          },
          error: (err) => {
            console.error(err);
            this.loading = false;
          }
        });
      },
      error: () => {
        this.taskService.getById(id).subscribe({
          next: (task) => {
            this.task = task;
            this.loading = false;
          },
          error: (err) => {
            console.error(err);
            this.loading = false;
          }
        });
      }
    });
  }

  get assignedUserName(): string {
    if (!this.task) return '';
    if (this.task.user?.name) return this.task.user.name;

    const user = this.users.find(u => u.id === this.task?.userId);
    return user?.name ?? 'Chưa gán';
  }
}