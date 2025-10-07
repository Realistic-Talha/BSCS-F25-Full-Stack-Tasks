const talhaStorageKey = 'talha_tasks_v1';

function talhaUid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
}

function talhaLoad() {
  try {
    const raw = localStorage.getItem(talhaStorageKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function talhaSave(tasks) {
  localStorage.setItem(talhaStorageKey, JSON.stringify(tasks));
}

function talhaNow() {
  return new Date().toISOString();
}

let talhaTasks = talhaLoad();
let talhaFilter = 'all';
let talhaSort = 'new';
let talhaQuery = '';

const els = {
  tasksList: document.getElementById('tasksList'),
  emptyState: document.getElementById('emptyState'),
  taskForm: document.getElementById('taskForm'),
  titleInput: document.getElementById('titleInput'),
  descInput: document.getElementById('descInput'),
  priorityInput: document.getElementById('priorityInput'),
  totalCount: document.getElementById('totalCount'),
  activeCount: document.getElementById('activeCount'),
  completedCount: document.getElementById('completedCount'),
  filters: document.querySelectorAll('.chip'),
  searchInput: document.getElementById('searchInput'),
  clearSearch: document.getElementById('clearSearch'),
  sortSelect: document.getElementById('sortSelect'),
  clearCompleted: document.getElementById('clearCompleted'),
  clearAll: document.getElementById('clearAll'),
  editModal: document.getElementById('editModal'),
  editForm: document.getElementById('editForm'),
  editTitle: document.getElementById('editTitle'),
  editDesc: document.getElementById('editDesc'),
  editPriority: document.getElementById('editPriority'),
  cancelEdit: document.getElementById('cancelEdit'),
};

function talhaRenderTasks() {
  let list = Array.from(talhaTasks);

  if (talhaFilter === 'active') list = list.filter(t => !t.completed);
  if (talhaFilter === 'completed') list = list.filter(t => t.completed);

  if (talhaQuery) {
    const q = talhaQuery.toLowerCase();
    list = list.filter(t => t.title.toLowerCase().includes(q) || (t.description||'').toLowerCase().includes(q));
  }

  if (talhaSort === 'new') list.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  if (talhaSort === 'old') list.sort((a,b) => a.createdAt.localeCompare(b.createdAt));
  if (talhaSort === 'priority') list.sort((a,b) => (b.priority?1:0) - (a.priority?1:0) || b.createdAt.localeCompare(a.createdAt));
  if (talhaSort === 'title') list.sort((a,b) => a.title.localeCompare(b.title));

  els.tasksList.innerHTML = '';

  if (list.length === 0) {
    els.emptyState.style.display = '';
  } else {
    els.emptyState.style.display = 'none';
    const fragment = document.createDocumentFragment();
    list.forEach(task => {
      const card = document.createElement('article');
      card.className = 'task-card';
      card.setAttribute('data-id', task.id);

      const left = document.createElement('div');
      left.className = 'task-left';

      const titleRow = document.createElement('div');
      titleRow.className = 'task-title';

      const checkbox = document.createElement('button');
      checkbox.className = 'checkbox' + (task.completed ? ' checked' : '');
      checkbox.innerHTML = task.completed ? '✓' : '';
      checkbox.title = task.completed ? 'Mark as active' : 'Mark as completed';
      checkbox.addEventListener('click', () => talhaToggleComplete(task.id));

      const titleText = document.createElement('div');
      titleText.className = 'title-text';
      titleText.textContent = task.title;

      const badge = document.createElement('div');
      badge.className = 'badge priority';
      badge.textContent = task.priority ? 'High' : 'Normal';
      if (!task.priority) badge.style.opacity = '0.6';

      titleRow.appendChild(checkbox);
      titleRow.appendChild(titleText);
      titleRow.appendChild(badge);

      const desc = document.createElement('div');
      desc.className = 'task-desc';
      desc.textContent = task.description || '';

      const meta = document.createElement('div');
      meta.className = 'meta';
      const time = document.createElement('div');
      time.textContent = new Date(task.createdAt).toLocaleString();
      meta.appendChild(time);

      left.appendChild(titleRow);
      left.appendChild(desc);
      left.appendChild(meta);

      const actions = document.createElement('div');
      actions.className = 'actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'icon';
      editBtn.innerHTML = '✎';
      editBtn.title = 'Edit task';
      editBtn.addEventListener('click', () => talhaOpenEdit(task.id));

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'icon';
      deleteBtn.innerHTML = '🗑';
      deleteBtn.title = 'Delete task';
      deleteBtn.addEventListener('click', () => talhaDelete(task.id));

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      card.appendChild(left);
      card.appendChild(actions);
      fragment.appendChild(card);
    });
    els.tasksList.appendChild(fragment);
  }

  const total = talhaTasks.length;
  const completed = talhaTasks.filter(t => t.completed).length;
  const active = total - completed;
  els.totalCount.textContent = total;
  els.activeCount.textContent = active;
  els.completedCount.textContent = completed;
}

function talhaAddTask(e) {
  e.preventDefault();
  const title = els.titleInput.value.trim();
  if (!title) return;
  const description = els.descInput.value.trim();
  const priority = !!els.priorityInput.checked;

  const task = {
    id: talhaUid(),
    title,
    description,
    priority,
    completed: false,
    createdAt: talhaNow(),
    updatedAt: talhaNow()
  };

  talhaTasks.unshift(task);
  talhaSave(talhaTasks);
  els.taskForm.reset();
  talhaRenderTasks();
}

function talhaDelete(id) {
  if (!confirm('Delete this task?')) return;
  talhaTasks = talhaTasks.filter(t => t.id !== id);
  talhaSave(talhaTasks);
  talhaRenderTasks();
}

function talhaToggleComplete(id) {
  talhaTasks = talhaTasks.map(t => {
    if (t.id === id) {
      return {...t, completed: !t.completed, updatedAt: talhaNow()};
    }
    return t;
  });
  talhaSave(talhaTasks);
  talhaRenderTasks();
}

let talhaEditingId = null;

function talhaOpenEdit(id) {
  const task = talhaTasks.find(t => t.id === id);
  if (!task) return;
  talhaEditingId = id;
  els.editTitle.value = task.title;
  els.editDesc.value = task.description || '';
  els.editPriority.checked = !!task.priority;
  els.editModal.setAttribute('aria-hidden', 'false');
  els.editModal.style.display = 'flex';
  els.editTitle.focus();
}

function talhaCloseEdit() {
  talhaEditingId = null;
  els.editModal.setAttribute('aria-hidden', 'true');
  els.editModal.style.display = 'none';
}

function talhaSaveEdit(e) {
  e.preventDefault();
  if (!talhaEditingId) return;
  const title = els.editTitle.value.trim();
  if (!title) return;
  const description = els.editDesc.value.trim();
  const priority = !!els.editPriority.checked;

  talhaTasks = talhaTasks.map(t => t.id === talhaEditingId ? {...t, title, description, priority, updatedAt: talhaNow()} : t);
  talhaSave(talhaTasks);
  talhaCloseEdit();
  talhaRenderTasks();
}

function talhaApplyFilter(filter) {
  talhaFilter = filter;
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.filter === filter));
  talhaRenderTasks();
}

function talhaApplySearch(q) {
  talhaQuery = q || '';
  talhaRenderTasks();
}

function talhaApplySort(val) {
  talhaSort = val;
  talhaRenderTasks();
}

function talhaClearCompleted() {
  if (!confirm('Remove all completed tasks?')) return;
  talhaTasks = talhaTasks.filter(t => !t.completed);
  talhaSave(talhaTasks);
  talhaRenderTasks();
}

function talhaClearAll() {
  if (!confirm('Remove all tasks? This cannot be undone.')) return;
  talhaTasks = [];
  talhaSave(talhaTasks);
  talhaRenderTasks();
}

function talhaInit() {
  talhaRenderTasks();

  els.taskForm.addEventListener('submit', talhaAddTask);
  els.filters.forEach(f => f.addEventListener('click', () => talhaApplyFilter(f.dataset.filter)));
  els.searchInput.addEventListener('input', (e) => talhaApplySearch(e.target.value));
  els.clearSearch.addEventListener('click', () => { els.searchInput.value=''; talhaApplySearch(''); });
  els.sortSelect.addEventListener('change', (e) => talhaApplySort(e.target.value));
  els.clearCompleted.addEventListener('click', talhaClearCompleted);
  els.clearAll.addEventListener('click', talhaClearAll);

  els.editForm.addEventListener('submit', talhaSaveEdit);
  els.cancelEdit.addEventListener('click', talhaCloseEdit);
  els.editModal.addEventListener('click', (ev) => { if (ev.target === els.editModal) talhaCloseEdit(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') talhaCloseEdit();
  });
}

talhaInit();
