import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Task } from '../models/task.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly apiUrl = `${environment.apiBaseUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getAll(filters?: { userId?: string; status?: string; priority?: string }): Observable<Task[]> {
    let params = new HttpParams();

    if (filters?.userId) {
      params = params.set('userId', filters.userId);
    }
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.priority) {
      params = params.set('priority', filters.priority);
    }

    return this.http.get<unknown[]>(this.apiUrl, { params }).pipe(
      map(tasks => tasks.map(task => this.normalizeTask(task)))
    );
  }

  getById(id: number): Observable<Task> {
    return this.http.get<unknown>(`${this.apiUrl}/${id}`).pipe(
      map(task => this.normalizeTask(task))
    );
  }

  create(task: Partial<Task>): Observable<Task> {
    return this.http.post<unknown>(this.apiUrl, this.toPayload(task)).pipe(
      map(response => this.normalizeTask(response))
    );
  }

  update(id: number, task: Partial<Task>): Observable<Task> {
    return this.http.put<unknown>(`${this.apiUrl}/${id}`, this.toPayload(task)).pipe(
      map(response => this.normalizeTask(response))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private toPayload(task: Partial<Task>) {
    return {
      title: task.title ?? '',
      description: task.description ?? '',
      status: task.status ?? 'TODO',
      priority: task.priority ?? 'MEDIUM',
      dueDate: task.dueDate || null,
      userId: task.userId ?? null
    };
  }

  private normalizeTask(raw: unknown): Task {
    const task = raw as any;
    return {
      id: task.id,
      title: task.title ?? '',
      description: task.description ?? '',
      status: task.status ?? 'TODO',
      priority: task.priority ?? 'MEDIUM',
      dueDate: task.dueDate ?? '',
      userId: task.userId ?? task.user?.id ?? null,
      user: task.user
        ? {
            id: task.user.id,
            name: task.user.name,
            email: task.user.email,
            role: task.user.role
          }
        : null,
      createdAt: task.createdAt
    };
  }
}
