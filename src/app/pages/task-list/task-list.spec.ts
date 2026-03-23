import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { TaskListComponent } from './task-list';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';

describe('TaskListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskListComponent],
      providers: [
        provideRouter([]),
        {
          provide: TaskService,
          useValue: {
            getAll: () => of([]),
            create: () => of({}),
            update: () => of({}),
            delete: () => of(void 0)
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
    const fixture = TestBed.createComponent(TaskListComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
