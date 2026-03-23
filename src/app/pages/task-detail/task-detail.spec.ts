import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { TaskDetailComponent } from './task-detail';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';

describe('TaskDetailComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetailComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1'
              }
            }
          }
        },
        {
          provide: TaskService,
          useValue: {
            getById: () => of({ id: 1, title: 'Demo', description: '', status: 'TODO', priority: 'LOW', dueDate: '', userId: null })
          }
        },
        {
          provide: UserService,
          useValue: {
            getAll: () => of([])
          }
        }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TaskDetailComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
