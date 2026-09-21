const priorityRank = { high: 0, medium: 1, low: 2 };

export function sortTasks(tasks) {
  return [...tasks].sort((first, second) => {
    if (first.completed !== second.completed) return Number(first.completed) - Number(second.completed);
    if (first.dueDate && second.dueDate && first.dueDate !== second.dueDate) return first.dueDate.localeCompare(second.dueDate);
    if (first.dueDate && !second.dueDate) return -1;
    if (!first.dueDate && second.dueDate) return 1;
    if (priorityRank[first.priority] !== priorityRank[second.priority]) return priorityRank[first.priority] - priorityRank[second.priority];
    return new Date(second.createdAt) - new Date(first.createdAt);
  });
}

export function filterTasks(tasks, filter, query) {
  const normalized = query.trim().toLowerCase();
  return tasks.filter((task) => {
    const statusMatches = filter === 'all' || (filter === 'completed' ? task.completed : !task.completed);
    const queryMatches = !normalized || `${task.title} ${task.note || ''}`.toLowerCase().includes(normalized);
    return statusMatches && queryMatches;
  });
}

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function dueLabel(dueDate, now = new Date()) {
  if (!dueDate) return null;
  const today = localDateKey(now);
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  if (dueDate < today) return { text: 'Overdue', tone: 'danger' };
  if (dueDate === today) return { text: 'Today', tone: 'danger' };
  if (dueDate === localDateKey(tomorrow)) return { text: 'Tomorrow', tone: 'neutral' };
  const [year, month, day] = dueDate.split('-').map(Number);
  return {
    text: new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(year, month - 1, day)),
    tone: 'neutral',
  };
}
