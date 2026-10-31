"use strict";

const STORAGE_KEY = "bot-test-checklist.tasks.v1";
const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const error = document.querySelector("#input-error");
const list = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const remainingCount = document.querySelector("#remaining-count");
const completionCount = document.querySelector("#completion-count");
const storageNote = document.querySelector("#storage-note");
const announcement = document.querySelector("#announcement");

let tasks = [];

try {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  if (Array.isArray(stored)) {
    tasks = stored
      .filter(task =>
        task &&
        typeof task.text === "string" &&
        task.text.trim().length > 0 &&
        typeof task.completed === "boolean"
      )
      .map(task => ({
        text: task.text.trim().slice(0, 200),
        completed: task.completed
      }));
  }
} catch {
  storageNote.textContent = "Session only";
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    storageNote.textContent = "Saved on this device";
  } catch {
    storageNote.textContent = "Session only — storage unavailable";
  }
}

function updateCounts() {
  const completed = tasks.filter(task => task.completed).length;
  remainingCount.textContent = `${tasks.length - completed} remaining`;
  completionCount.textContent = `${completed} of ${tasks.length} completed`;
  emptyState.hidden = tasks.length > 0;
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = "task";
  item.classList.toggle("completed", task.completed);

  const label = document.createElement("label");
  label.className = "task-label";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;

  const text = document.createElement("span");
  text.textContent = task.text;
  label.append(checkbox, text);

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "delete-button";
  deleteButton.setAttribute("aria-label", `Delete task: ${task.text}`);
  deleteButton.title = "Delete task";
  deleteButton.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6"/></svg>';

  checkbox.addEventListener("change", () => {
    task.completed = checkbox.checked;
    item.classList.toggle("completed", task.completed);
    saveTasks();
    updateCounts();
  });

  deleteButton.addEventListener("click", () => {
    const nextFocus = item.nextElementSibling?.querySelector(".delete-button")
      || item.previousElementSibling?.querySelector(".delete-button")
      || input;

    tasks = tasks.filter(existing => existing !== task);
    item.remove();
    saveTasks();
    updateCounts();
    announcement.textContent = `Deleted: ${task.text}`;
    nextFocus.focus();
  });

  item.append(label, deleteButton);
  return item;
}

function clearError() {
  error.hidden = true;
  error.textContent = "";
  input.removeAttribute("aria-invalid");
}

input.addEventListener("input", clearError);

form.addEventListener("submit", event => {
  event.preventDefault();
  const text = input.value.trim();

  if (!text) {
    error.textContent = "Please enter a task first.";
    error.hidden = false;
    input.setAttribute("aria-invalid", "true");
    input.focus();
    return;
  }

  clearError();
  const task = { text, completed: false };
  tasks.push(task);
  list.append(createTaskElement(task));
  saveTasks();
  updateCounts();
  input.value = "";
  input.focus();
  announcement.textContent = `Added: ${text}`;
});

tasks.forEach(task => list.append(createTaskElement(task)));
updateCounts();
