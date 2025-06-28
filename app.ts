import { Repository, Result } from './utils';

// Types and Interfaces
type TodoStatus = 'pending' | 'in-progress' | 'completed';
type TodoPriority = 'low' | 'medium' | 'high';

interface Todo {
    id: number;
    text: string;
    status: TodoStatus;
    createdAt: Date;
    updatedAt: Date;
    dueDate?: Date;
    priority: TodoPriority;
}

// DTOs for API communication
interface CreateTodoDto {
    text: string;
    priority: TodoPriority;
    dueDate?: string;
}

type UpdateTodoDto = {
    text?: string;
    status?: TodoStatus;
    priority?: TodoPriority;
    dueDate?: string | Date | null;
};

interface TodoResponse extends Omit<Todo, 'dueDate'> {
    dueDate: string | null;
}

// Application state with repository pattern
class TodoAppState {
    private todoRepository: Repository<Todo>;

    constructor() {
        this.todoRepository = new Repository<Todo>([]);
    }
    private _filter: 'all' | TodoStatus = 'all';

    get filter(): 'all' | TodoStatus {
        return this._filter;
    }

    set filter(value: 'all' | TodoStatus) {
        this._filter = value;
    }

    get todos(): Todo[] {
        const allTodos = this.todoRepository.getAll() || [];
        if (this._filter === 'all') {
            return allTodos;
        }
        return allTodos.filter(todo => todo.status === this._filter);
    }

    addTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Result<Todo> {
        try {
            const now = new Date();
            const newTodo = {
                ...todo,
                id: 0, // Will be set by the repository
                createdAt: now,
                updatedAt: now
            };
            const createdTodo = this.todoRepository.create(newTodo);
            return Result.ok(createdTodo);
        } catch (error) {
            console.error('Error adding todo:', error);
            return Result.fail<Todo>('Failed to add todo');
        }
    }

    updateTodo(id: number, updates: UpdateTodoDto): Result<Todo> {
        const todo = this.todoRepository.getById(id);
        if (!todo) {
            return Result.fail<Todo>('Todo not found');
        }

        // Create a new object with only the fields that are being updated
        const updateData: Partial<Todo> = {
            updatedAt: new Date()
        };

        // Copy non-undefined properties from updates to updateData
        if (updates.text !== undefined) updateData.text = updates.text;
        if (updates.status !== undefined) updateData.status = updates.status;
        if (updates.priority !== undefined) updateData.priority = updates.priority;
        
        // Handle dueDate conversion if it's being updated
        if ('dueDate' in updates) {
            updateData.dueDate = updates.dueDate === null 
                ? undefined 
                : updates.dueDate instanceof Date 
                    ? updates.dueDate 
                    : updates.dueDate 
                        ? new Date(updates.dueDate) 
                        : todo.dueDate;
        }

        const updatedTodo = this.todoRepository.update(id, updateData);

        return updatedTodo 
            ? Result.ok(updatedTodo) 
            : Result.fail<Todo>('Failed to update todo');
    }

    deleteTodo(id: number): Result<boolean> {
        const success = this.todoRepository.delete(id);
        return success 
            ? Result.ok(true) 
            : Result.fail<boolean>('Todo not found');
    }

    // API response formatters
    formatTodoResponse(todo: Todo): TodoResponse {
        return {
            ...todo,
            dueDate: todo.dueDate ? todo.dueDate.toISOString() : null
        };
    }

    formatTodoListResponse(todos: Todo[]) {
        return todos.map(todo => this.formatTodoResponse(todo));
    }
}

// Type Guards
function isTodoStatus(status: string): status is TodoStatus {
    return ['pending', 'in-progress', 'completed'].includes(status);
}

function isTodoPriority(priority: string): priority is TodoPriority {
    return ['low', 'medium', 'high'].includes(priority);
}

function isValidTodo(todo: unknown): todo is Todo {
    if (typeof todo !== 'object' || todo === null) return false;
    
    const t = todo as Record<string, unknown>;
    
    return (
        typeof t.id === 'number' &&
        typeof t.text === 'string' &&
        isTodoStatus(t.status as string) &&
        t.createdAt instanceof Date &&
        t.updatedAt instanceof Date &&
        (t.dueDate === undefined || t.dueDate instanceof Date) &&
        isTodoPriority(t.priority as string)
    );
}

// Utility types for form handling
type TodoFormData = {
    text: string;
    priority: TodoPriority;
    dueDate?: string;
};

type TodoUpdateData = Partial<Omit<Todo, 'id' | 'createdAt'>> & { id: number };

// Helper function to safely get DOM elements
function getElement<T extends HTMLElement>(selector: string): T {
    const element = document.querySelector<T>(selector);
    if (!element) {
        throw new Error(`Element not found: ${selector}`);
    }
    return element;
}

// Initialize the application
const appState = new TodoAppState();

// DOM Elements
const todoForm = getElement<HTMLFormElement>('#todo-form');
const todoInput = getElement<HTMLInputElement>('#todo-input');
const todoList = getElement<HTMLUListElement>('#todo-list');
const prioritySelect = getElement<HTMLSelectElement>('#priority');
const dueDateInput = getElement<HTMLInputElement>('#due-date');
const filterButtons = document.querySelectorAll<HTMLButtonElement>('.filter-btn');

// State Management
async function addTodo(todoData: CreateTodoDto): Promise<void> {
    if (!todoData.text.trim()) return;

    const result = appState.addTodo({
        text: todoData.text.trim(),
        status: 'pending',
        priority: todoData.priority || 'medium',
        dueDate: todoData.dueDate ? new Date(todoData.dueDate) : undefined
    });

    if (result.isSuccess) {
        todoInput.value = '';
        prioritySelect.value = 'medium';
        dueDateInput.value = '';
        renderTodos();
        showNotification('Todo added successfully', 'success');
    if (result.isSuccess) {
        renderTodos();
        showNotification('Todo updated successfully', 'success');
    } else {
        showNotification(result.error || 'Failed to update todo', 'error');
        // Revert the select value on error
        const todo = appState.todos.find(t => t.id === id);
        if (todo) {
            select.value = todo.status;
        }
    }
}

function handleDeleteTodo(event: Event): void {
    const button = event.currentTarget as HTMLButtonElement;
    const id = parseInt(button.dataset.id || '', 10);
    
    if (!id) return;
    
    if (confirm('Are you sure you want to delete this todo?')) {
        const result = appState.deleteTodo(id);
        if (result.isSuccess) {
            renderTodos();
            showNotification('Todo deleted successfully', 'success');
        } else {
            showNotification(result.error || 'Failed to delete todo', 'error');
        }
    }
}

function handleFilterChange(event: Event): void {
    const button = event.currentTarget as HTMLButtonElement;
    const filter = button.dataset.filter as 'all' | TodoStatus;
    
    if (!filter) return;
    
    // Set the filter in the app state
    appState.filter = filter;
    renderTodos();
    
    // Update active state of filter buttons
    filterButtons.forEach(btn => {
        if (btn instanceof HTMLElement) {
            btn.classList.toggle('active', btn === button);
        }
    });
}

function handleAddTodo(event: Event): void {
    event.preventDefault();
    
    const text = todoInput.value.trim();
    if (!text) {
        showNotification('Please enter a task', 'error');
        return;
    }

    const priority = prioritySelect.value as TodoPriority;
    const dueDate = dueDateInput.value ? new Date(dueDateInput.value) : undefined;

    const result = appState.addTodo({
        text,
        status: 'pending',
        priority,
        dueDate
    });

    if (result.isSuccess) {
        todoInput.value = '';
        prioritySelect.value = 'medium';
        dueDateInput.value = '';
        renderTodos();
        showNotification('Todo added successfully', 'success');
    } else {
        showNotification(result.error || 'Failed to add todo', 'error');
    }
}

function resetForm(): void {
    todoInput.value = '';
    prioritySelect.value = 'medium';
    dueDateInput.value = '';
}

function showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger reflow to enable transition
    void notification.offsetWidth;
    
    notification.classList.add('show');
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        notification.addEventListener('transitionend', () => {
            notification.remove();
        }, { once: true });
    }, 5000);
}

// Event Handlers
function handleAddTodo(event: Event) {
    event.preventDefault();
    
    const text = todoInput.value.trim();
    if (!text) {
        showNotification('Please enter a task', 'error');
        return;
    }

    const priority = prioritySelect.value as TodoPriority;
    const dueDate = dueDateInput.value ? new Date(dueDateInput.value) : undefined;

    const result = appState.addTodo({
        text,
        status: 'pending',
        priority,
        dueDate
    });

    if (result.isSuccess) {
        todoInput.value = '';
        prioritySelect.value = 'medium';
        dueDateInput.value = '';
        renderTodos();
        showNotification('Todo added successfully', 'success');
    } else {
        showNotification(result.error || 'Failed to add todo', 'error');
    }
}

function handleFilterChange(event: Event) {
    const target = event.target as HTMLButtonElement;
    const filter = target.dataset.filter as 'all' | TodoStatus;
    
    if (!filter) return;
    
    appState.filter = filter;
    renderTodos();
    
    // Update active state of filter buttons
    filterButtons.forEach(btn => {
        if (btn instanceof HTMLElement) {
            btn.classList.toggle('active', btn === target);
        }
    });
}

// Render functions
function renderTodos() {
    const todos = appState.todos;
    
    if (todos.length === 0) {
        todoList.innerHTML = '<li class="empty-state">No todos found. Add one above!</li>';
        return;
    }
    
    todoList.innerHTML = todos.map(todo => {
        const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;
        const isOverdue = dueDate && dueDate < new Date() && todo.status !== 'completed';
        
        return `
        <li class="todo-item ${todo.status === 'completed' ? 'completed' : ''}" data-id="${todo.id}">
            <div class="todo-content">
                <h3 class="todo-text">${escapeHtml(todo.text)}</h3>
                <div class="todo-meta">
                    <span class="priority ${todo.priority}">${todo.priority}</span>
                    ${dueDate ? `
                        <span class="due-date ${isOverdue ? 'overdue' : ''}" 
                              title="${dueDate.toLocaleString()}">
                            Due: ${formatDate(dueDate)}${isOverdue ? ' (Overdue)' : ''}
                        </span>` 
                    : ''}
                    <span class="updated" title="${new Date(todo.updatedAt).toLocaleString()}">
                        Updated: ${formatTimeAgo(todo.updatedAt)}
                    </span>
                </div>
            </div>
            <div class="todo-actions">
                <select class="status-select" data-id="${todo.id}">
                    <option value="pending" ${todo.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="in-progress" ${todo.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                    <option value="completed" ${todo.status === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
                <button class="btn btn-delete" data-id="${todo.id}" aria-label="Delete todo">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </li>`;
    }).join('');
    
    // Add event listeners to status selects and delete buttons
    document.querySelectorAll<HTMLSelectElement>('.status-select').forEach(select => {
        select.addEventListener('change', handleStatusChange);
    });
    
    document.querySelectorAll<HTMLButtonElement>('.btn-delete').forEach(button => {
        button.addEventListener('click', handleDeleteTodo);
    });
}

function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatTimeAgo(date: Date | string): string {
    const d = new Date(date);
    const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
        }
    }
    
    return 'just now';
}


// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Set minimum due date to today
        const today = new Date().toISOString().split('T')[0];
        dueDateInput.min = today;
        
        // Set up event listeners
        todoForm.addEventListener('submit', handleAddTodo);
        filterButtons.forEach(button => {
            button.addEventListener('click', handleFilterChange);
        });
        
        // Initial render
        renderTodos();
        
        // Set focus to the input field for better UX
        todoInput.focus();
    } catch (error) {
        console.error('Error initializing application:', error);
        showNotification('Failed to initialize application', 'error');
    }
});
