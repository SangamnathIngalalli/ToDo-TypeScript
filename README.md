# Simple To-Do App with TypeScript

🔗 [Live Demo](https://sangamnathingalalli.github.io/ToDo-TypeScript/)

A beginner-friendly To-Do application built with TypeScript, HTML, and CSS that demonstrates fundamental TypeScript concepts.

## TypeScript Concepts Used

### 1. Advanced Type Definitions
- **Union and Literal Types**: Used for strict type checking of status and priority values
  ```typescript
  type TodoStatus = 'pending' | 'in-progress' | 'completed';
  type TodoPriority = 'low' | 'medium' | 'high';
  ```

### 2. Interfaces and Type Aliases
- **Interfaces** for defining object shapes and DTOs
- **Type Aliases** for complex type definitions
  ```typescript
  interface Todo {
      id: number;
      text: string;
      status: TodoStatus;
      createdAt: Date;
      updatedAt: Date;
      dueDate?: Date;
      priority: TodoPriority;
  }
  
  type UpdateTodoDto = {
      text?: string;
      status?: TodoStatus;
      priority?: TodoPriority;
      dueDate?: string | Date | null;
  };
  ```

### 3. Generic Types and Classes
- **Generic Repository Pattern** for type-safe data access
- **Generic API Response Types** for consistent API communication
  ```typescript
  class Repository<T extends { id: number }> {
      private items: T[] = [];
      // ...
  }
  
  interface ApiResponse<T> {
      data: T;
      status: number;
      success: boolean;
      message?: string;
      timestamp: Date;
  }
  ```

### 4. Type Guards and Type Predicates
- **Custom Type Guards** for runtime type checking
  ```typescript
  function isTodoStatus(status: string): status is TodoStatus {
      return ['pending', 'in-progress', 'completed'].includes(status);
  }
  
  function isValidTodo(todo: unknown): todo is Todo {
      // Implementation checks all required properties
  }
  ```

### 5. Utility Types
- **Mapped Types** and **Conditional Types** for flexible type transformations
  ```typescript
  interface TodoResponse extends Omit<Todo, 'dueDate'> {
      dueDate: string | null;
  }
  
  type TodoFormData = {
      text: string;
      priority: TodoPriority;
      dueDate?: string;
  };
  ```

### 6. Result Pattern
- **Discriminated Union** for handling success/failure states
  ```typescript
  class Result<T> {
      private constructor(
          public isSuccess: boolean, 
          public error?: string, 
          private _value?: T
      ) {}
      
      static ok<U>(value?: U): Result<U> {
          return new Result<U>(true, undefined, value);
      }
      
      static fail<U>(error: string): Result<U> {
          return new Result<U>(false, error);
      }
  }
  ```

### 7. Advanced DOM Typing
- **Type Assertions** and **Type Narrowing** for safe DOM manipulation
  ```typescript
  function getElement<T extends HTMLElement>(selector: string): T {
      const element = document.querySelector<T>(selector);
      if (!element) {
          throw new Error(`Element not found: ${selector}`);
      }
      return element;
  }
  
  // Usage with type safety
  const todoForm = getElement<HTMLFormElement>('#todo-form');
  const todoInput = getElement<HTMLInputElement>('#todo-input');
  ```

### 8. Optional Chaining and Nullish Coalescing
- **Safe Property Access** with optional chaining (`?.`)
- **Default Values** with nullish coalescing (`??`)
  ```typescript
  const dueDate = todo.dueDate?.toISOString() ?? null;
  ```

### 9. Date Handling with Type Safety
- **Type-Safe Date Manipulation** with proper type checking
  ```typescript
  updateData.dueDate = updates.dueDate === null 
      ? undefined 
      : updates.dueDate instanceof Date 
          ? updates.dueDate 
          : updates.dueDate 
              ? new Date(updates.dueDate) 
              : todo.dueDate;
  ```

### 10. Event Handling with Strict Typing
- **Type-Safe Event Handlers** with proper event types
  ```typescript
  function handleFilterChange(event: Event): void {
      const target = event.target as HTMLButtonElement;
      const filterValue = target.dataset.filter as TodoStatus | 'all';
      // ...
  }
  
  // Strongly-typed event listeners
  todoForm.addEventListener('submit', handleAddTodo);
  filterButtons.forEach(btn => {
      btn.addEventListener('click', handleFilterChange);
  });
  ```
  }
  ```

### 11. Array Type Annotations
- Explicitly typing arrays and their contents
- Example:
  ```typescript
  let todos: Todo[] = [];  // Array of Todo objects
  ```

### 12. Optional Chaining and Nullish Coalescing
- Safe property access and default values
- Example (implicit in DOM operations):
  ```typescript
  const text = todoInput.value?.trim() ?? '';  // Safe property access with fallback
  ```

### 13. TypeScript Configuration (tsconfig.json)
- Configured with strict type checking
- Set target to ES6 for modern JavaScript features
- Module system configuration
- Source map generation for debugging
- Strict null checks enabled
- Implicit any type checking

## How to Run

1. Install TypeScript globally (if not already installed):
   ```
   npm install -g typescript
   ```

2. Compile TypeScript to JavaScript:
   ```
   tsc
   ```

3. Open `index.html` in a web browser

## Features

- Add new todos
- Mark todos as complete/incomplete
- Delete todos
- Responsive design
- Type-safe code with TypeScript

## 📬 Contact

📧 **Email**: [sangamnath.professional@gmail.com](mailto:sangamnath.professional@gmail.com)

💼 **LinkedIn**: [Sangamnath Ingalalli](https://www.linkedin.com/in/sangamnath-ingalalli/)

💻 **GitHub**: [SangamnathIngalalli](https://github.com/SangamnathIngalalli)

🌐 **Portfolio**: [sangamnathingalalli.github.io](https://sangamnathingalalli.github.io/portfolio/)
