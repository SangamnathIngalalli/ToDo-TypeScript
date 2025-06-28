# Simple To-Do App with TypeScript

A beginner-friendly To-Do application built with TypeScript, HTML, and CSS that demonstrates fundamental TypeScript concepts.

## TypeScript Concepts Used

### 1. Type Annotations
- Used to specify the type of variables, function parameters, and return values
- Example: 
  ```typescript
  const todoInput = document.getElementById('todoInput') as HTMLInputElement;
  let nextId: number = 1;
  ```

### 2. Interfaces
- Used to define the structure of an object
- Example:
  ```typescript
  interface Todo {
      id: number;
      text: string;
      completed: boolean;
  }
  ```

### 3. Type Assertions
- Used to tell TypeScript the type of a value when TypeScript can't infer it
- Example:
  ```typescript
  const todoList = document.getElementById('todoList') as HTMLUListElement;
  ```

### 4. Array Methods with TypeScript
- Using array methods like `map()`, `filter()`, and `forEach()` with type safety
- Example:
  ```typescript
  todos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  ```

### 5. Spread Operator
- Used for creating new objects/arrays from existing ones
- Example:
  ```typescript
  const newTodo: Todo = {
      id: nextId++,
      text,
      completed: false
  };
  ```

### 6. Event Handling with TypeScript
- Type-safe event listeners and event objects
- Example:
  ```typescript
  todoInput.addEventListener('keypress', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
          addTodo();
      }
  });
  ```

### 7. DOM Manipulation with Type Safety
- Using TypeScript's built-in DOM types for HTML elements
- Example:
  ```typescript
  const li = document.createElement('li');
  li.innerHTML = `...`;
  todoList.appendChild(li);
  ```

### 8. Template Literal Types
- Used for creating string literal types that can be used for string manipulation
- Example (implicitly used in event handlers):
  ```typescript
  li.innerHTML = `
      <span onclick="toggleTodo(${todo.id})">${todo.text}</span>
      <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
  `;
  ```

### 9. Type Inference
- TypeScript's ability to automatically infer types when they're not explicitly defined
- Example:
  ```typescript
  // TypeScript infers that nextId is a number
  let nextId = 1;
  
  // TypeScript infers the return type of addTodo as void
  function addTodo() { ... }
  ```

### 10. Type Widening and Narrowing
- TypeScript automatically widens and narrows types based on control flow
- Example:
  ```typescript
  const text = todoInput.value.trim();  // TypeScript knows this is a string
  if (text) {  // TypeScript narrows the type in this block
      // ...
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
