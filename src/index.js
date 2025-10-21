import "./style.css";

// === Load existing todos from localStorage ===
let todos = JSON.parse(localStorage.getItem("todos")) || [];

document.addEventListener("DOMContentLoaded", () => {
  // Query DOM elements after DOMContentLoaded
  const cloudBtn = document.querySelector(".cloud-btn");
  const taskForm = document.querySelector(".task-form");
  const cancelBtn = document.querySelector(".cancel-btn");
  const sortBtn = document.querySelector(".sort-btn");
  const dropdown = document.querySelector(".dropdown");
  const sortDate = document.querySelector(".sort-date");
  const sortPriority = document.querySelector(".sort-priority"); // fixed selector

  // Guard: if essential elements are missing, log and exit early
  if (!taskForm || !cloudBtn || !document.querySelector(".task-list")) {
    console.warn("Some required DOM elements are missing. Check your HTML structure.");
    return;
  }

  // Show form when clicking cloud button
  cloudBtn.addEventListener("click", () => {
    taskForm.classList.remove("hidden");
  });

  // Hide form when clicking cancel
  cancelBtn.addEventListener("click", () => {
    taskForm.classList.add("hidden");
  });

  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addTodo();
  });

  // show sort options when click sort
  if (sortBtn && dropdown) {
    sortBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("show");
    });

    // close dropdown when clicking outside
    window.addEventListener("click", (e) => {
      if (!e.target.matches(".sort-btn")) dropdown.classList.remove("show");
    });
  }

  if (sortDate) {
    sortDate.addEventListener("click", (e) => {
      e.preventDefault();
      sortbydate();
    });
  }

  if (sortPriority) {
    sortPriority.addEventListener("click", (e) => {
      e.preventDefault();
      sortbyPriority();
    });
  }

  // initial render after DOM ready
  showTodos();
}); // end DOMContentLoaded



function addTodo() {
  const title = document.querySelector(".task-title").value.trim();
  const description = document.querySelector(".task-desc").value.trim();
  const duedate = document.querySelector(".due-date").value.trim();
  const priority = document.querySelector('input[name="priority"]:checked')?.value;

  if (!title || !duedate || !priority) {
    alert("Please fill in all required fields.");
    return;
  }

  const newTodo = {
    id: Date.now(),
    title,
    description,
    duedate,
    priority,
    completed: false
  };

  todos.push(newTodo);
  saveTodos();
  showTodos();

  // clear form
  document.querySelector(".task-form").reset();
  document.querySelector(".task-form").classList.add("hidden");
}

// === Save todos to localStorage ===
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function showTodos() {
  const taskList = document.querySelector(".task-list");
  taskList.innerHTML = "";

  todos.forEach((todo) => {
    const li = document.createElement("li");

    // Wrap text info
    const content = document.createElement("div");
    content.classList.add("task-content");

    const titleEl = document.createElement("h2");
    titleEl.textContent = todo.title;
    titleEl.classList.add("task-title");

    const infoRow = document.createElement("div");
    infoRow.classList.add("task-info");

    const dueEl = document.createElement("span");
    dueEl.textContent = "Due:🗓️ " + todo.duedate;

    const priorityEl = document.createElement("span");
    if (todo.priority === "High") {
      priorityEl.textContent = "Priority:⭐️⭐️⭐️ " + todo.priority;
    } else if (todo.priority === "Medium") {
      priorityEl.textContent = "Priority:⭐️⭐️ " + todo.priority;
    } else {
      priorityEl.textContent = "Priority:⭐️ " + todo.priority;
    }

    infoRow.appendChild(dueEl);
    infoRow.appendChild(priorityEl);

    const descEl = document.createElement("p");
    descEl.textContent = todo.description || "(no details)";
    descEl.classList.add("task-desc");

    content.appendChild(titleEl);
    content.appendChild(infoRow);
    content.appendChild(descEl);

    // Delete button
    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.classList.add("delete-btn");
    delBtn.onclick = (event) => {
      event.stopPropagation();
      removeTodo(todo.id);
    };

    // Put content + button side by side
    const container = document.createElement("div");
    container.classList.add("task-row");
    container.appendChild(content);
    container.appendChild(delBtn);

    li.appendChild(container);

    // Click to toggle completion
    li.onclick = () => toggleComplete(todo.id);
    if (todo.completed) li.classList.add("completed");

    taskList.appendChild(li);
  });
}

// === Toggle complete status ===
function toggleComplete(id) {
    todos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    showTodos();
}

// === Remove todo ===
function removeTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    showTodos();
}

// === Sort by Date (exclude completed) ===
function sortbydate() {
  const incomplete = todos.filter(t => !t.completed);
  const complete = todos.filter(t => t.completed);

  incomplete.sort((a, b) => new Date(a.duedate) - new Date(b.duedate));

  todos = [...incomplete, ...complete]; // incomplete first, then completed
  saveTodos();
  showTodos();
}

// === Sort by Priority (exclude completed) ===
function sortbyPriority() {
  const incomplete = todos.filter(t => !t.completed);
  const complete = todos.filter(t => t.completed);

  const priorityOrder = { High: 1, Medium: 2, Low: 3 };

  incomplete.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  todos = [...incomplete, ...complete]; // incomplete first, then completed
  saveTodos();
  showTodos();
}
