let dragcard = null;
let currentCard = null;

function DeleteDrag() {
  return ["todo", "doing", "submit"].forEach((columnid) => {
    updateTaskcount(columnid);
  });
}

function addTask(columnid) {
  const input = document.getElementById(`${columnid}-input`);
  const tasktext = input.value.trim();
  if (tasktext === "") return;
  // if changed to todo, doing, review
  const options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  const events = new Date().toLocaleString();

  const taskElement = createtaskelement(tasktext, events);

  document.getElementById(`${columnid}-task`).appendChild(taskElement);
  input.value = "";
  updateTaskcount(columnid);
  savetasktolacalStroge(columnid, tasktext, events);
}

function createtaskelement(tasktext, events) {
  const taskelement = document.createElement("div");
  taskelement.innerHTML = `<h3>${tasktext}</h3><br><h6>${events}</h6>`;
  taskelement.classList.add("task");
  taskelement.classList.add("card");
  taskelement.draggable = true;

  taskelement.addEventListener("dragstart", dragstart);
  taskelement.addEventListener("dragend", dragend);

  taskelement.addEventListener("contextmenu", (event) => {
    event.preventDefault();

    currentCard = taskelement;
    showcontextmenu(event.pageX, event.pageY);
  });

  return taskelement;
}

function dragstart() {
  setTimeout(() => {
    this.classList.add("dragging");
  }, 20);
  dragcard = this;
}

function dragend() {
  this.classList.remove("dragging");
  dragcard = null;
  DeleteDrag();
  updateTasktolocalstroge();
}

const columns = document.querySelectorAll(".column .task");
columns.forEach((column) => {
  column.addEventListener("dragover", dragover);
});

function dragover(event) {
  event.preventDefault();
  this.appendChild(dragcard);
  const afterelement = getelementbefore(this, event.pageY);
  if (afterelement === null) {
    this.appendChild(dragcard);
  } else {
    this.insertBefore(dragcard, afterelement);
  }
}
function getelementbefore(container, y) {
  let dragbleelements = [...container.querySelectorAll(".card:not(.dragging)")];
  const result = dragbleelements.reduce(
    (closeselement, currenttask) => {
      const box = currenttask.getBoundingClientRect();
      const offset = y - (box.top + box.height / 2);
      if (offset < 0 && offset > closeselement.offset) {
        return { offset: offset, element: currenttask };
      } else {
        return closeselement;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  );
  return result.element;
}

const contextmenu = document.querySelector(".context-menu");

function showcontextmenu(x, y) {
  contextmenu.style.left = `${x}px`;
  contextmenu.style.top = `${y}px`;
  contextmenu.style.display = "block";
}

// Hide context menu when clicking elsewhere
document.addEventListener("click", function () {
  contextmenu.style.display = "none";
});

// Context Menu Actions
function editTask() {
  const titleElement1 = currentCard.querySelector("h3");
  const timeElement2 = currentCard.querySelector("h6");

  const newText = prompt("Edit task:", titleElement1.innerText);

  if (newText !== null && newText.trim() !== "") {
    titleElement1.innerText = newText;
  }
  updateTasktolocalstroge();
}
function deleteTask() {
  currentCard.remove();
  DeleteDrag();
  updateTasktolocalstroge();
}
document.addEventListener("DOMContentLoaded", laodtasktolocalstorage);
function updateTaskcount(columnid) {
  const count = document.querySelectorAll(`#${columnid}-task .card`).length;
  document.getElementById(`${columnid}-count`).textContent = count;
}
function savetasktolacalStroge(columnid, tasktext, events) {
  const tasks = [];

  tasks.push({ text: tasktext, date: events });

  localStorage.setItem(columnid, JSON.stringify(tasks));
}
function laodtasktolocalstorage() {
  ["todo", "doing", "submit"].forEach((columnid) => {
    const task = JSON.parse(localStorage.getItem(columnid)) || [];
    task.forEach(({ text, date }) => {
      const taskelements = createtaskelement(text, date);
      document.getElementById(`${columnid}-task`).appendChild(taskelements);
    });
    updateTaskcount(columnid);
  });
}
function updateTasktolocalstroge() {
  ["todo", "doing", "submit"].forEach((columnid) => {
    const task = [];
    document.querySelectorAll(`#${columnid}-task .card`).forEach((card) => {
      const tasktext = card.querySelector("h3").textContent;
      const date = card.querySelector("h6").textContent;
      task.push({ text: tasktext, date: date });
    });
    localStorage.setItem(columnid, JSON.stringify(task));
  });
}
