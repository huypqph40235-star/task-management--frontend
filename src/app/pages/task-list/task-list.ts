import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { Task } from '../../models/task.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css'
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  users: User[] = [];

  loading = false;
  submitting = false;
  errorMessage = '';
  successMessage = '';
  editingTaskId: number | null = null;

  filter = {
    userId: '',
    status: '',
    priority: ''
  };

  taskForm: {
    title: string;
    description: string;
    status: 'TODO' | 'DOING' | 'DONE';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    dueDate: string;
    userId: number | null;
  } = {
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
    userId: null
  };

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.filter.userId = params.get('userId') ?? '';
      this.loadTasks();
    });

    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: users => {
        this.users = users ?? [];
      },
      error: error => {
        console.error('Load users error:', error);
        this.errorMessage = 'Không tải được danh sách user.';
      }
    });
  }

  loadTasks(): void {
    this.loading = true;
    this.errorMessage = '';

    this.taskService.getAll(this.filter).subscribe({
      next: tasks => {
        this.tasks = tasks ?? [];
        this.loading = false;
      },
      error: error => {
        console.error('Load tasks error:', error);
        this.errorMessage = 'Không tải được danh sách task.';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        userId: this.filter.userId || null,
        status: this.filter.status || null,
        priority: this.filter.priority || null
      },
      queryParamsHandling: 'merge'
    });
  }

  resetFilter(): void {
    this.filter = {
      userId: '',
      status: '',
      priority: ''
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        userId: null,
        status: null,
        priority: null
      }
    });
  }

  submitTask(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.taskForm.title.trim()) {
      this.errorMessage = 'Title không được để trống.';
      return;
    }

    if (!this.taskForm.userId) {
      this.errorMessage = 'Bạn phải chọn user.';
      return;
    }

    const payload: Partial<Task> = {
      title: this.taskForm.title.trim(),
      description: this.taskForm.description.trim(),
      status: this.taskForm.status,
      priority: this.taskForm.priority,
      dueDate: this.taskForm.dueDate,
      userId: Number(this.taskForm.userId)
    };

    this.submitting = true;

    const request$ = this.editingTaskId
      ? this.taskService.update(this.editingTaskId, payload)
      : this.taskService.create(payload);

    request$.subscribe({
      next: savedTask => {
        const normalizedTask = this.attachUser(savedTask);

        if (this.editingTaskId) {
          this.tasks = this.tasks.map(task =>
            task.id === this.editingTaskId ? normalizedTask : task
          );
          this.successMessage = 'Cập nhật task thành công.';
        } else {
          if (this.matchCurrentFilter(normalizedTask)) {
            this.tasks = [normalizedTask, ...this.tasks];
          }
          this.successMessage = 'Tạo task thành công.';
        }

        this.resetForm();
        this.submitting = false;

        if (this.hasFilter()) {
          this.loadTasks();
        }
      },
      error: error => {
        console.error('Save task error:', error);
        this.errorMessage = this.editingTaskId
          ? 'Cập nhật task thất bại.'
          : 'Tạo task thất bại.';
        this.submitting = false;
      }
    });
  }

  editTask(task: Task): void {
    this.editingTaskId = task.id ?? null;
    this.errorMessage = '';
    this.successMessage = '';

    this.taskForm = {
      title: task.title ?? '',
      description: task.description ?? '',
      status: task.status ?? 'TODO',
      priority: task.priority ?? 'MEDIUM',
      dueDate: task.dueDate ?? '',
      userId: task.userId ?? task.user?.id ?? null
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteTask(id?: number): void {
    if (!id) {
      return;
    }

    const confirmed = confirm('Bạn có chắc muốn xóa task này?');
    if (!confirmed) {
      return;
    }

    this.taskService.delete(id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(task => task.id !== id);
        if (this.editingTaskId === id) {
          this.resetForm();
        }
        this.successMessage = 'Xóa task thành công.';
        this.errorMessage = '';
      },
      error: error => {
        console.error('Delete task error:', error);
        this.errorMessage = 'Xóa task thất bại.';
      }
    });
  }

  resetForm(): void {
    this.editingTaskId = null;
    this.taskForm = {
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: '',
      userId: null
    };
  }

  viewDetail(id?: number): void {
    if (!id) {
      return;
    }
    this.router.navigate(['/tasks', id]);
  }

  getUserName(task: Task): string {
    if (task.user?.name) {
      return task.user.name;
    }
    const user = this.users.find(item => item.id === task.userId);
    return user?.name ?? 'Chưa gán';
  }

  trackByTaskId(_index: number, task: Task): number | undefined {
    return task.id;
  }

  private attachUser(task: Task): Task {
    const user = this.users.find(item => item.id === task.userId);
    if (!user) {
      return task;
    }

    return {
      ...task,
      user: {
        id: user.id!,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  private hasFilter(): boolean {
    return !!(this.filter.userId || this.filter.status || this.filter.priority);
  }

  private matchCurrentFilter(task: Task): boolean {
    const byUser = !this.filter.userId || Number(this.filter.userId) === task.userId;
    const byStatus = !this.filter.status || this.filter.status === task.status;
    const byPriority = !this.filter.priority || this.filter.priority === task.priority;
    return byUser && byStatus && byPriority;
  }
}
