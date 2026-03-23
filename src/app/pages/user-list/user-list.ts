import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Không tải được danh sách user';
        this.loading = false;
      }
    });
  }

  submit(form: NgForm): void {
    if (form.invalid || this.submitting) {
      form.control.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      name: this.userForm.name.trim(),
      email: this.userForm.email.trim(),
      role: this.userForm.role.trim()
    };

    const request = this.editingId
      ? this.userService.update(this.editingId, payload)
      : this.userService.create(payload);

    request.subscribe({
      next: (savedUser) => {
        if (this.editingId) {
          this.users = this.users.map(u => u.id === this.editingId ? savedUser : u);
          this.successMessage = 'Cập nhật user thành công';
        } else {
          this.users = [savedUser, ...this.users];
          this.successMessage = 'Tạo user thành công';
        }

        this.resetForm(form);
        this.submitting = false;
      },
      error: () => {
        this.errorMessage = this.editingId
          ? 'Cập nhật user thất bại'
          : 'Tạo user thất bại';
        this.submitting = false;
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
  }

  delete(id: number | undefined): void {
    if (!id || !confirm('Bạn có chắc muốn xóa user này?')) return;

    this.userService.delete(id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== id);
        this.successMessage = 'Xóa user thành công';
      },
      error: () => {
        this.errorMessage = 'Xóa user thất bại';
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
  }
}