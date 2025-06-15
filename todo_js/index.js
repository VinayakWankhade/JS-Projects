document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("taskModal");
  const input = document.getElementById("modalTaskInput");
  const taskList = document.getElementById("taskList");
  const themeToggleBtn = document.getElementById("themeToggleBtn");

  // Sidebar toggle (assuming sidebar exists)
  const sidebar = document.getElementById("sidebar"); // add this to your HTML if not present
  const sidebarToggleBtn = document.getElementById("sidebarToggleBtn"); // a button for toggling sidebar on mobile

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let currentFilter = "all"; // "all", "completed", "inProgress"

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  // Animate task item appearance/removal by adding/removing CSS classes
  function animateTaskIn(taskItem) {
    taskItem.classList.add("fade-in");
    setTimeout(() => taskItem.classList.remove("fade-in"), 500);
  }

  function animateTaskOut(taskItem, callback) {
    taskItem.classList.add("fade-out");
    setTimeout(() => {
      callback();
    }, 400);
  }

  function renderTasks() {
    taskList.innerHTML = "";

    let filteredTasks = tasks;
    if (currentFilter === "completed") {
      filteredTasks = tasks.filter(task => task.completed);
    } else if (currentFilter === "inProgress") {
      filteredTasks = tasks.filter(task => !task.completed);
    }

    filteredTasks.forEach((task, index) => {
      const taskItem = document.createElement("div");
      taskItem.className = "task-item";
      taskItem.draggable = true;
      taskItem.dataset.index = index;

      // Animate on add
      animateTaskIn(taskItem);

      // Drag and drop
      taskItem.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", index);
        e.target.classList.add("dragging");
      });

      taskItem.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        e.target.classList.add("drag-over");
      });

      taskItem.addEventListener("dragleave", (e) => {
        e.target.classList.remove("drag-over");
      });

      taskItem.addEventListener("drop", (e) => {
        e.preventDefault();
        const fromIndex = e.dataTransfer.getData("text/plain");
        const toIndex = e.target.dataset.index;

        if (fromIndex !== toIndex) {
          const movedTask = tasks.splice(fromIndex, 1)[0];
          tasks.splice(toIndex, 0, movedTask);
          saveTasks();
          renderTasks();
        }
      });

      // Checkbox
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.completed;
      checkbox.style.marginRight = "10px";
      checkbox.onchange = () => {
        task.completed = checkbox.checked;
        saveTasks();
        renderTasks();
      };

      // Task Text
      const taskText = document.createElement("span");
      taskText.innerText = `${task.text}${task.date ? ` (Due: ${task.date})` : ""}`;
      taskText.style.textDecoration = task.completed ? "line-through" : "none";
      taskText.style.color = task.completed ? "#aaa" : "#fff";
      taskText.style.marginLeft = "5px";

      const taskRow = document.createElement("div");
      taskRow.style.display = "flex";
      taskRow.style.alignItems = "center";
      taskRow.appendChild(checkbox);
      taskRow.appendChild(taskText);
      taskItem.appendChild(taskRow);

      // Actions
      const actions = document.createElement("div");
      actions.className = "task-actions";

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.innerText = "Delete";
      deleteBtn.onclick = () => {
        // Animate removal before deleting
        animateTaskOut(taskItem, () => {
          tasks.splice(index, 1);
          saveTasks();
          renderTasks();
        });
      };

      const editBtn = document.createElement("button");
      editBtn.className = "edit-btn";
      editBtn.innerText = "Edit";
      editBtn.onclick = () => {
        const newTask = prompt("Edit your task:", task.text);
        if (newTask !== null) {
          tasks[index].text = newTask.trim() || task.text;
          saveTasks();
          renderTasks();
        }
      };

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);
      taskItem.appendChild(actions);

      taskList.appendChild(taskItem);
    });

    updateFilterButtonCounts();
  }

  // Modal Functions
  window.openModal = function () {
    modal.style.display = "flex";
    input.focus();
  };

  window.closeModal = function () {
    modal.style.display = "none";
    input.value = "";
    document.getElementById("modalTaskDate").value = "";
  };

  // Filter
  window.setFilter = function (filter) {
    currentFilter = filter;
    renderTasks();
    updateFilterButtonStyles();
  };

  function updateFilterButtonStyles() {
    const buttons = {
      all: document.getElementById("filter-all"),
      completed: document.getElementById("filter-completed"),
      inProgress: document.getElementById("filter-inProgress"),
    };

    for (let key in buttons) {
      buttons[key].classList.remove("active-filter");
    }

    if (buttons[currentFilter]) {
      buttons[currentFilter].classList.add("active-filter");
    }
  }

  // Update filter button text with counts
  function updateFilterButtonCounts() {
    const allCount = tasks.length;
    const completedCount = tasks.filter(t => t.completed).length;
    const inProgressCount = tasks.filter(t => !t.completed).length;

    const buttons = {
      all: document.getElementById("filter-all"),
      completed: document.getElementById("filter-completed"),
      inProgress: document.getElementById("filter-inProgress"),
    };

    if (buttons.all) buttons.all.innerText = `All (${allCount})`;
    if (buttons.completed) buttons.completed.innerText = `Completed (${completedCount})`;
    if (buttons.inProgress) buttons.inProgress.innerText = `In Progress (${inProgressCount})`;
  }

  // Add Task
  window.addTaskFromModal = function () {
    const value = input.value.trim();
    if (!value) {
      alert("Please enter a task.");
      return;
    }

    const date = document.getElementById("modalTaskDate").value;
    tasks.push({ text: value, date: date, completed: false });
    saveTasks();
    renderTasks();
    closeModal();
  };

  // Theme toggle logic
  function setTheme(mode) {
    document.body.classList.remove("light-mode", "dark-mode");
    document.body.classList.add(`${mode}-mode`);
    localStorage.setItem("theme", mode);
  }

  const savedTheme = localStorage.getItem("theme") || "dark";
  setTheme(savedTheme);

  themeToggleBtn.onclick = () => {
    const newTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
    setTheme(newTheme);
  };

  // Sidebar toggle for mobile (example implementation)
  if (sidebarToggleBtn && sidebar) {
    sidebarToggleBtn.onclick = () => {
      sidebar.classList.toggle("collapsed");
    };
  }

  // Initial load
  renderTasks();
  updateFilterButtonStyles();
});
