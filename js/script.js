/* ============================================================
   script.js - shared behaviour for every page
   Sections: 1. Navigation and footer
             2. Academic planner (add / complete / delete)
             3. Contact form validation
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  setUpNavigation();
  setUpFooterYear();
  setUpPlanner();
  setUpContactForm();
});

/* ---------- 1. Navigation and footer ---------- */

function setUpNavigation() {
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("siteNav");

  if (!toggle || !nav) {
    return;
  }

  // On small screens the menu is collapsed; the button opens and closes it.
  toggle.addEventListener("click", function () {
    nav.classList.toggle("open");
  });
}

function setUpFooterYear() {
  // Writes the current year into the footer so it never goes out of date.
  var yearSpan = document.getElementById("year");

  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

/* ---------- 2. Academic planner ---------- */

// Every task lives in this array as an object:
// { id: number, text: string, dueDate: string, completed: boolean }
var tasks = [];

function setUpPlanner() {
  var form = document.getElementById("taskForm");

  if (!form) {
    return; // We are not on the planner page.
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault(); // Stop the page from reloading.
    addTask();
  });
}

function addTask() {
  var input = document.getElementById("taskInput");
  var dateInput = document.getElementById("taskDate");
  var errorBox = document.getElementById("plannerError");
  var text = input.value.trim();

  if (text === "") {
    errorBox.textContent = "Please describe the task before adding it.";
    input.focus();
    return;
  }

  errorBox.textContent = "";

  tasks.push({
    id: Date.now(),          // A timestamp makes a simple unique id.
    text: text,
    dueDate: dateInput.value,
    completed: false
  });

  input.value = "";
  dateInput.value = "";
  input.focus();
  renderTasks();
}

function toggleTask(id) {
  // Flip the completed flag on the matching task.
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      tasks[i].completed = !tasks[i].completed;
    }
  }
  renderTasks();
}

function deleteTask(id) {
  // Keep every task except the one being removed.
  tasks = tasks.filter(function (task) {
    return task.id !== id;
  });
  renderTasks();
}

function renderTasks() {
  var list = document.getElementById("taskList");
  var summary = document.getElementById("taskSummary");

  list.innerHTML = ""; // Clear the list and rebuild it from the array.

  tasks.forEach(function (task) {
    var item = document.createElement("li");
    if (task.completed) {
      item.classList.add("done");
    }

    var textSpan = document.createElement("span");
    textSpan.className = "task-text";
    textSpan.textContent = task.text;

    var dateSpan = document.createElement("span");
    dateSpan.className = "task-date";
    dateSpan.textContent = task.dueDate ? "Due: " + task.dueDate : "";

    var completeButton = document.createElement("button");
    completeButton.className = "icon-btn complete-btn";
    completeButton.textContent = "✓";
    completeButton.setAttribute(
      "aria-label",
      task.completed ? "Mark task as not done" : "Mark task as done"
    );
    completeButton.addEventListener("click", function () {
      toggleTask(task.id);
    });

    var deleteButton = document.createElement("button");
    deleteButton.className = "icon-btn delete-btn";
    deleteButton.textContent = "✕";
    deleteButton.setAttribute("aria-label", "Delete task");
    deleteButton.addEventListener("click", function () {
      deleteTask(task.id);
    });

    item.appendChild(textSpan);
    item.appendChild(dateSpan);
    item.appendChild(completeButton);
    item.appendChild(deleteButton);
    list.appendChild(item);
  });

  updateSummary(summary);
}

function updateSummary(summary) {
  // Dynamic content: the summary line updates every time the list changes.
  var total = tasks.length;
  var done = tasks.filter(function (task) {
    return task.completed;
  }).length;

  if (total === 0) {
    summary.textContent = "No tasks yet. Add your first one above.";
  } else {
    summary.textContent =
      "You have completed " + done + " of " + total +
      (total === 1 ? " task." : " tasks.");
  }
}

/* ---------- 3. Contact form validation ---------- */

function setUpContactForm() {
  var form = document.getElementById("contactForm");

  if (!form) {
    return; // We are not on the contact page.
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault(); // Validate before anything is sent.
    validateContactForm();
  });
}

function validateContactForm() {
  var isValid = true;

  var name = document.getElementById("name");
  var email = document.getElementById("email");
  var phone = document.getElementById("phone");
  var message = document.getElementById("message");
  var status = document.getElementById("formStatus");

  // Patterns: a simple email shape, and digits only for the phone number.
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var phonePattern = /^[0-9]{7,15}$/;

  // Name: must not be empty.
  if (name.value.trim() === "") {
    showError(name, "nameError", "Please enter your name.");
    isValid = false;
  } else {
    clearError(name, "nameError");
  }

  // Email: must not be empty and must look like an email address.
  if (email.value.trim() === "") {
    showError(email, "emailError", "Please enter your email address.");
    isValid = false;
  } else if (!emailPattern.test(email.value.trim())) {
    showError(email, "emailError", "That email address does not look right. Check it and try again.");
    isValid = false;
  } else {
    clearError(email, "emailError");
  }

  // Phone: must not be empty and must contain digits only.
  if (phone.value.trim() === "") {
    showError(phone, "phoneError", "Please enter your phone number.");
    isValid = false;
  } else if (!phonePattern.test(phone.value.trim())) {
    showError(phone, "phoneError", "The phone number should contain digits only (7 to 15 of them).");
    isValid = false;
  } else {
    clearError(phone, "phoneError");
  }

  // Message: must not be empty.
  if (message.value.trim() === "") {
    showError(message, "messageError", "Please write a short message.");
    isValid = false;
  } else {
    clearError(message, "messageError");
  }

  if (isValid) {
    status.textContent = "Thank you, " + name.value.trim() +
      ". Your message has been received and I will get back to you soon.";
    status.className = "success";
    document.getElementById("contactForm").reset();
  } else {
    status.textContent = "";
    status.className = "";
  }
}

function showError(field, errorId, messageText) {
  field.classList.add("invalid");
  document.getElementById(errorId).textContent = messageText;
}

function clearError(field, errorId) {
  field.classList.remove("invalid");
  document.getElementById(errorId).textContent = "";
}
