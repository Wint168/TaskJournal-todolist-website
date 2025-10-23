import "./style.css";
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

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
  const sortPriority = document.querySelector(".sort-priority"); 


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
  renderTodosOnCalendar();

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
  renderTodosOnCalendar();


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
    renderTodosOnCalendar();

}

// === Remove todo ===
function removeTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    showTodos();
    renderTodosOnCalendar();

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

function renderTodosOnCalendar() {
  const calendarEl = document.getElementById('calendar');
  const calendar = new Calendar(calendarEl, {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    height: '100%',
    contentHeight: 'auto',
    events: todos.map(todo => ({
      title: todo.title,
      start: todo.duedate,
      allDay: true,
      extendedProps: { completed: todo.completed } // pass completed status
    })),
    eventDidMount: function(info) {
      // Style completed tasks
      if (info.event.extendedProps.completed) {
        info.el.style.backgroundColor = "#ac6ad8";
        info.el.style.opacity = "0.7";

        // Target inner text element
        const titleEl = info.el.querySelector(".fc-event-title");
        if (titleEl) {
          titleEl.style.color = "black";
          titleEl.style.textDecoration = "line-through";
        }
      } else {
        info.el.style.backgroundColor = "#ac7ad8";
        const titleEl = info.el.querySelector(".fc-event-title");
        if (titleEl) titleEl.style.color = "black";
      }
    },

     dateClick: function(info) {
      const clickedDate = info.dateStr;
      const dayTodos = todos.filter(t => t.duedate === clickedDate);
      const detailsBox = document.getElementById("calendar-details");

      if (dayTodos.length === 0) {
        detailsBox.innerHTML = `<p>No tasks on ${clickedDate}</p>`;
      } else {
        let html = `<h3>Tasks for ${clickedDate}</h3>`;
        dayTodos.forEach(t => {
          html += `
            <p><strong>${t.title}</strong></p>
            <p>Priority: ${t.priority}</p>
            <p>${t.description || "(no description)"}</p>
            <hr>
          `;
        });
        detailsBox.innerHTML = html;
      }
    }
  });
  calendar.render();
}
