var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// Type Guards
function isTodoStatus(status) {
    return ['pending', 'in-progress', 'completed'].includes(status);
}
function isTodoPriority(priority) {
    return ['low', 'medium', 'high'].includes(priority);
}
function isValidTodo(todo) {
    if (typeof todo !== 'object' || todo === null)
        return false;
    var t = todo;
    return (typeof t.id === 'number' &&
        typeof t.text === 'string' &&
        isTodoStatus(t.status) &&
        t.createdAt instanceof Date &&
        t.updatedAt instanceof Date &&
        (t.dueDate === undefined || t.dueDate instanceof Date) &&
        isTodoPriority(t.priority));
}
// DOM Elements with null checks
function getElementOrThrow(id) {
    var element = document.getElementById(id);
    if (!element) {
        throw new Error("Element with id '".concat(id, "' not found"));
    }
    return element;
}
var todoInput = getElementOrThrow('todoInput');
var addButton = getElementOrThrow('addBtn');
var todoList = getElementOrThrow('todoList');
var prioritySelect = getElementOrThrow('prioritySelect');
var dueDateInput = getElementOrThrow('dueDateInput');
// Application State
var initialState = {
    todos: [],
    nextId: 1,
    filter: 'all'
};
var state = __assign({}, initialState);
// State Management
function addTodo(todoData) {
    if (!todoData.text.trim())
        return;
    var newTodo = {
        id: state.nextId,
        text: todoData.text.trim(),
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        priority: todoData.priority || 'medium',
        dueDate: todoData.dueDate ? new Date(todoData.dueDate) : undefined
    };
    state = __assign(__assign({}, state), { todos: __spreadArray(__spreadArray([], state.todos, true), [newTodo], false), nextId: state.nextId + 1 });
    renderTodos();
    resetForm();
}
function updateTodo(updateData) {
    state = __assign(__assign({}, state), { todos: state.todos.map(function (todo) {
            return todo.id === updateData.id
                ? __assign(__assign(__assign({}, todo), updateData), { updatedAt: new Date() }) : todo;
        }) });
    renderTodos();
}
function deleteTodo(id) {
    state = __assign(__assign({}, state), { todos: state.todos.filter(function (todo) { return todo.id !== id; }) });
    renderTodos();
}
function resetForm() {
    todoInput.value = '';
    prioritySelect.value = 'medium';
    dueDateInput.value = '';
}
// Event Handlers
function handleAddTodo() {
    var priority = prioritySelect.value;
    if (!isTodoPriority(priority)) {
        console.error('Invalid priority value');
        return;
    }
    var todoData = {
        text: todoInput.value,
        priority: priority,
        dueDate: dueDateInput.value || undefined
    };
    addTodo(todoData);
}
// Render functions
function renderTodos() {
    todoList.innerHTML = '';
    var filteredTodos = state.filter === 'all'
        ? state.todos
        : state.todos.filter(function (todo) { return todo.status === state.filter; });
    filteredTodos.forEach(function (todo) {
        var li = document.createElement('li');
        li.className = "todo-item ".concat(todo.status);
        var statusClass = todo.status === 'completed' ? 'completed' : '';
        var dueDateText = todo.dueDate
            ? "Due: ".concat(todo.dueDate.toLocaleDateString())
            : 'No due date';
        li.innerHTML = "\n            <div class=\"todo-content\">\n                <h3 class=\"todo-text ".concat(statusClass, "\">").concat(todo.text, "</h3>\n                <div class=\"todo-meta\">\n                    <span class=\"priority ").concat(todo.priority, "\">").concat(todo.priority, "</span>\n                    <span class=\"due-date\">").concat(dueDateText, "</span>\n                    <span class=\"status\">").concat(todo.status, "</span>\n                </div>\n                <div class=\"todo-actions\">\n                    <select class=\"status-select\" data-id=\"").concat(todo.id, "\">\n                        <option value=\"pending\" ").concat(todo.status === 'pending' ? 'selected' : '', ">Pending</option>\n                        <option value=\"in-progress\" ").concat(todo.status === 'in-progress' ? 'selected' : '', ">In Progress</option>\n                        <option value=\"completed\" ").concat(todo.status === 'completed' ? 'selected' : '', ">Completed</option>\n                    </select>\n                    <button class=\"delete-btn\" data-id=\"").concat(todo.id, "\">Delete</button>\n                </div>\n            </div>\n        ");
        todoList.appendChild(li);
    });
    // Add event listeners to dynamically created elements
    document.querySelectorAll('.status-select').forEach(function (select) {
        select.addEventListener('change', function (e) {
            var target = e.target;
            var id = parseInt(target.dataset.id || '0', 10);
            var status = target.value;
            if (isTodoStatus(status)) {
                updateTodo({
                    id: id,
                    status: status
                });
            }
            else {
                console.error('Invalid status value');
            }
        });
    });
    document.querySelectorAll('.delete-btn').forEach(function (button) {
        button.addEventListener('click', function (e) {
            var target = e.target;
            var id = parseInt(target.dataset.id || '0', 10);
            if (!isNaN(id)) {
                deleteTodo(id);
            }
            else {
                console.error('Invalid todo ID');
            }
        });
    });
}
// Event Listeners
addButton.addEventListener('click', handleAddTodo);
todoInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        handleAddTodo();
    }
});
// Filter event listeners
document.querySelectorAll('[data-filter]').forEach(function (button) {
    button.addEventListener('click', function (e) {
        var target = e.target;
        var filter = target.dataset.filter;
        if (filter === 'all' || isTodoStatus(filter)) {
            state = __assign(__assign({}, state), { filter: filter });
            renderTodos();
        }
        else {
            console.error('Invalid filter value');
        }
    });
});
// Initial render
renderTodos();
