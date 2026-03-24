import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
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
    userId: string;
  } = {
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: '',
      userId: ''
    };

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.filter.userId = params.get('userId') ?? '';
      this.filter.status = params.get('status') ?? '';
      this.filter.priority = params.get('priority') ?? '';
      this.loadTasks();
    });

    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (users) => {
        this.users = users ?? [];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Load users error:', error);
        this.users = [];
        this.cdr.detectChanges();
      }
    });
  }

  loadTasks(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.taskService.getAll(this.filter).subscribe({
      next: (tasks) => {
        this.tasks = tasks ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Load tasks error:', error);
        this.errorMessage = 'Không tải được danh sách task.';
        this.loading = false;
        this.cdr.detectChanges();
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

  submitTask(form: NgForm): void {
    if (form.invalid || this.submitting) {
      form.control.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    const payload = {
      title: this.taskForm.title.trim(),
      description: this.taskForm.description.trim(),
      status: this.taskForm.status,
      priority: this.taskForm.priority,
      dueDate: this.taskForm.dueDate,
      userId: this.taskForm.userId ? Number(this.taskForm.userId) : null
    };

    const request$ = this.editingTaskId
      ? this.taskService.update(this.editingTaskId, payload)
      : this.taskService.create(payload);

    request$.subscribe({
      next: () => {
        this.successMessage = this.editingTaskId
          ? 'Cập nhật task thành công.'
          : 'Tạo task thành công.';

        this.editingTaskId = null;
        this.taskForm = {
          title: '',
          description: '',
          status: 'TODO',
          priority: 'MEDIUM',
          dueDate: '',
          userId: ''
        };

        form.resetForm({
          title: '',
          description: '',
          status: 'TODO',
          priority: 'MEDIUM',
          dueDate: '',
          userId: ''
        });

        this.submitting = false;
        this.loadTasks();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Save task error:', error);
        this.errorMessage = this.editingTaskId
          ? 'Cập nhật task thất bại.'
          : 'Tạo task thất bại.';
        this.submitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  editTask(task: Task): void {
    this.editingTaskId = task.id ?? null;
    this.taskForm = {
      title: task.title ?? '',
      description: task.description ?? '',
      status: (task.status as 'TODO' | 'DOING' | 'DONE') ?? 'TODO',
      priority: (task.priority as 'LOW' | 'MEDIUM' | 'HIGH') ?? 'MEDIUM',
      dueDate: task.dueDate ?? '',
      userId: task.userId ? String(task.userId) : ''
    };
    this.successMessage = '';
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  deleteTask(id?: number): void {
    if (!id) return;

    const confirmed = confirm('Bạn có chắc muốn xóa task này?');
    if (!confirmed) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    this.taskService.delete(id).subscribe({
      next: () => {
        if (this.editingTaskId === id) {
          this.editingTaskId = null;
          this.taskForm = {
            title: '',
            description: '',
            status: 'TODO',
            priority: 'MEDIUM',
            dueDate: '',
            userId: ''
          };
        }
        this.successMessage = 'Xóa task thành công.';
        this.loadTasks();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Delete task error:', error);
        this.errorMessage = 'Xóa task thất bại.';
        this.cdr.detectChanges();
      }
    });
  }

  viewDetail(id?: number): void {
    if (!id) return;
    this.router.navigate(['/tasks', id]);
  }

  resetForm(): void {
    this.editingTaskId = null;
    this.taskForm = {
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: '',
      userId: ''
    };
    this.cdr.detectChanges();
  }

  getUserName(task: Task): string {
    if (task.user?.name) return task.user.name;
    if (!task.userId) return 'Chưa gán';

    const user = this.users.find(u => u.id === task.userId);
    return user?.name ?? 'Chưa gán';
  }

  trackByTaskId(index: number, task: Task): number | undefined {
    return task.id;
  }
}