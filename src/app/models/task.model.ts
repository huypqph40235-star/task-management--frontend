export interface Task {
    id?: number;
    title: string;
    description: string;
    status: 'TODO' | 'DOING' | 'DONE';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    dueDate: string;
    userId: number | null;


    user?: {
        id: number;
        name: string;
        email?: string;
        role?: string;
    } | null;

    createdAt?: string;
}