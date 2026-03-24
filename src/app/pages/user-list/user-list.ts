import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css'
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = false;
  submitting = false;
  errorMessage = '';
  successMessage = '';

  editingId: number | null = null;

  userForm = {
    name: '',
    email: '',
    role: ''
  };

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Không tải được danh sách user.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  submit(form: NgForm): void {
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
      name: this.userForm.name.trim(),
      email: this.userForm.email.trim(),
      role: this.userForm.role.trim()
    };

    const isEdit = !!this.editingId;

    const request = isEdit
      ? this.userService.update(this.editingId!, payload)
      : this.userService.create(payload);

    request.subscribe({
      next: () => {
        this.successMessage = isEdit
          ? 'Cập nhật user thành công.'
          : 'Tạo user thành công.';

        this.resetForm(form);
        this.submitting = false;
        this.loadUsers();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = isEdit
          ? 'Cập nhật user thất bại.'
          : 'Tạo user thất bại.';
        this.submitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  edit(user: User): void {
    this.editingId = user.id ?? null;
    this.userForm = {
      name: user.name ?? '',
      email: user.email ?? '',
      role: user.role ?? ''
    };
    this.successMessage = '';
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  delete(id: number | undefined): void {
    if (!id || !confirm('Bạn có chắc muốn xóa user này?')) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    this.userService.delete(id).subscribe({
      next: () => {
        this.successMessage = 'Xóa user thành công.';
        this.loadUsers();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Xóa user thất bại.';
        this.cdr.detectChanges();
      }
    });
  }

  resetForm(form: NgForm): void {
    this.editingId = null;
    this.userForm = {
      name: '',
      email: '',
      role: ''
    };
    form.resetForm(this.userForm);
    this.cdr.detectChanges();
  }

  trackByUserId(index: number, user: User): number | undefined {
    return user.id;
  }
}