import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Calendar, Check, ChevronDown, ChevronsUp, CircleAlert, Minus, Pencil, Plus,
  RefreshCw, Search, Sparkles, Trash2, X,
} from 'lucide-react';
import { taskApi } from './api.js';
import { dueLabel, filterTasks, sortTasks } from './taskUtils.js';

const emptyDraft = () => ({ title: '', note: '', priority: 'medium', dueDate: '' });

function Logo() {
  return (
    <div className="brand" aria-label="Daymark">
      <svg className="brand__mark" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="currentColor" d="M8 6h15.2C33.6 6 42 14.4 42 24.8 42 34.3 34.3 42 24.8 42H8V6Z" />
        <path fill="none" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="m16 24.5 5.2 5.2L33 17.9" />
      </svg>
      <span>Daymark</span>
    </div>
  );
}

function Priority({ value }) {
  const Icon = value === 'high' ? ChevronsUp : value === 'low' ? ChevronDown : Minus;
  return <span className={`meta-item priority priority--${value}`}><Icon aria-hidden="true" /> {value[0].toUpperCase() + value.slice(1)}</span>;
}

function TaskRow({ task, pending, onToggle, onEdit, onDelete }) {
  const due = dueLabel(task.dueDate);
  return (
    <article className={`task-row${task.completed ? ' is-complete' : ''}`} data-testid={`task-${task.id}`}>
      <button
        className="check-button"
        type="button"
        aria-label={task.completed ? `Reopen ${task.title}` : `Mark ${task.title} complete`}
        aria-pressed={task.completed}
        disabled={pending}
        onClick={() => onToggle(task)}
      >
        <Check aria-hidden="true" />
      </button>
      <div className="task-row__body">
        <h3>{task.title}</h3>
        {task.note && <p>{task.note}</p>}
        <div className="task-meta">
          {task.completed ? (
            <span className="meta-item"><Check aria-hidden="true" /> Completed</span>
          ) : (
            <>
              {due && <span className={`meta-item meta-item--${due.tone}`}><Calendar aria-hidden="true" /> {due.text}</span>}
              <Priority value={task.priority} />
            </>
          )}
        </div>
      </div>
      <div className="task-row__actions">
        <button className="icon-button" type="button" aria-label={`Edit ${task.title}`} onClick={() => onEdit(task)} disabled={pending}><Pencil aria-hidden="true" /></button>
        <button className="icon-button icon-button--danger" type="button" aria-label={`Delete ${task.title}`} onClick={() => onDelete(task)} disabled={pending}><Trash2 aria-hidden="true" /></button>
      </div>
    </article>
  );
}

function TaskFields({ draft, setDraft, errors = {}, titleId, titleRef }) {
  return (
    <>
      <div className="field field--wide">
        <label htmlFor={titleId}>Title</label>
        <input
          id={titleId}
          ref={titleRef}
          value={draft.title}
          maxLength="120"
          onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? `${titleId}-error` : undefined}
        />
        {errors.title && <span className="field-error" id={`${titleId}-error`} role="alert">{errors.title}</span>}
      </div>
      <div className="field field--wide">
        <label htmlFor={`${titleId}-note`}>Note <span>optional</span></label>
        <textarea id={`${titleId}-note`} rows="3" maxLength="500" value={draft.note} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} />
        <span className="field-hint">{draft.note.length} / 500</span>
      </div>
      <div className="field">
        <label htmlFor={`${titleId}-date`}>Due date</label>
        <input id={`${titleId}-date`} type="date" value={draft.dueDate} onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))} />
      </div>
      <div className="field">
        <label htmlFor={`${titleId}-priority`}>Priority</label>
        <select id={`${titleId}-priority`} value={draft.priority} onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value }))}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
    </>
  );
}

function EmptyState({ filtered, onAdd }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true"><Sparkles /></span>
      <h3>{filtered ? 'No matching tasks' : 'Nothing on your list'}</h3>
      <p>{filtered ? 'Try another search or status filter.' : 'A clear list is a good place to start.'}</p>
      {!filtered && <button className="button button--primary" type="button" onClick={onAdd}>Add your first task</button>}
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [draftErrors, setDraftErrors] = useState({});
  const [editing, setEditing] = useState(null);
  const [editDraft, setEditDraft] = useState(emptyDraft);
  const [editErrors, setEditErrors] = useState({});
  const [deleting, setDeleting] = useState(null);
  const [pendingId, setPendingId] = useState(null);
  const [toast, setToast] = useState('');
  const quickInput = useRef(null);
  const editorTitle = useRef(null);
  const deleteCancel = useRef(null);

  async function loadTasks() {
    setLoading(true);
    setLoadError('');
    try {
      setTasks(sortTasks(await taskApi.list()));
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let activeRequest = true;
    taskApi.list()
      .then((items) => { if (activeRequest) setTasks(sortTasks(items)); })
      .catch((error) => { if (activeRequest) setLoadError(error.message); })
      .finally(() => { if (activeRequest) setLoading(false); });
    return () => { activeRequest = false; };
  }, []);

  useEffect(() => {
    if (editing) editorTitle.current?.focus();
    if (deleting) deleteCancel.current?.focus();
  }, [editing, deleting]);

  useEffect(() => {
    function closeOverlay(event) {
      if (event.key !== 'Escape') return;
      if (deleting) setDeleting(null);
      else if (editing) setEditing(null);
    }
    document.addEventListener('keydown', closeOverlay);
    return () => document.removeEventListener('keydown', closeOverlay);
  }, [editing, deleting]);

  const completed = tasks.filter((task) => task.completed).length;
  const active = tasks.length - completed;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const visibleTasks = useMemo(() => filterTasks(tasks, filter, query), [tasks, filter, query]);
  const filtered = filter !== 'all' || Boolean(query.trim());

  function announce(message) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2400);
  }

  function openComposer() {
    setComposerOpen(true);
    window.setTimeout(() => quickInput.current?.focus(), 0);
  }

  async function createTask(event) {
    event.preventDefault();
    const title = draft.title.trim();
    if (!title) {
      setDraftErrors({ title: 'Enter a task title.' });
      return;
    }
    setDraftErrors({});
    setPendingId('create');
    try {
      const task = await taskApi.create({
        title,
        note: draft.note.trim(),
        priority: draft.priority,
        dueDate: draft.dueDate || null,
      });
      setTasks((current) => sortTasks([...current, task]));
      setDraft(emptyDraft());
      setComposerOpen(false);
      announce('Task added.');
    } catch (error) {
      setDraftErrors(error.fields || { form: error.message });
    } finally {
      setPendingId(null);
    }
  }

  async function toggleTask(task) {
    setPendingId(task.id);
    try {
      const updated = await taskApi.update(task.id, { completed: !task.completed });
      setTasks((current) => sortTasks(current.map((item) => item.id === updated.id ? updated : item)));
      announce(updated.completed ? 'Task completed.' : 'Task reopened.');
    } catch (error) {
      announce(error.message);
    } finally {
      setPendingId(null);
    }
  }

  function openEditor(task) {
    setEditing(task);
    setEditDraft({ title: task.title, note: task.note || '', priority: task.priority, dueDate: task.dueDate || '' });
    setEditErrors({});
  }

  async function saveEdit(event) {
    event.preventDefault();
    if (!editDraft.title.trim()) {
      setEditErrors({ title: 'Enter a task title.' });
      return;
    }
    setPendingId(editing.id);
    setEditErrors({});
    try {
      const updated = await taskApi.update(editing.id, {
        title: editDraft.title.trim(), note: editDraft.note.trim(), priority: editDraft.priority, dueDate: editDraft.dueDate || null,
      });
      setTasks((current) => sortTasks(current.map((item) => item.id === updated.id ? updated : item)));
      setEditing(null);
      announce('Changes saved.');
    } catch (error) {
      setEditErrors(error.fields || { form: error.message });
    } finally {
      setPendingId(null);
    }
  }

  async function deleteTask() {
    setPendingId(deleting.id);
    try {
      await taskApi.remove(deleting.id);
      setTasks((current) => current.filter((task) => task.id !== deleting.id));
      setDeleting(null);
      announce('Task deleted.');
    } catch (error) {
      announce(error.message);
    } finally {
      setPendingId(null);
    }
  }

  const today = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <div className="app-shell">
      <header className="topbar">
        <Logo />
        <p className="topbar__date">{today}</p>
        <span className="privacy-note">Private to this browser</span>
      </header>

      <main className="main-content">
        <section className="intro" aria-labelledby="page-title">
          <div><p className="eyebrow">Your day, at a glance</p><h1 id="page-title">Make today count.</h1><p className="intro__copy">A quiet place for the work that matters.</p></div>
          <div className="progress-copy"><strong>{completed} of {tasks.length}</strong><span>tasks complete</span></div>
        </section>
        <div className="progress-track" role="progressbar" aria-label="Daily progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div>

        <form className={`composer${composerOpen ? ' is-open' : ''}`} onSubmit={createTask}>
          <div className="quick-add">
            <span className="quick-add__icon" aria-hidden="true"><Plus /></span>
            <label className="sr-only" htmlFor="quick-title">Task title</label>
            <input id="quick-title" ref={quickInput} maxLength="120" placeholder="What needs to get done?" value={draft.title} onFocus={() => setComposerOpen(true)} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} aria-invalid={Boolean(draftErrors.title)} aria-describedby={draftErrors.title ? 'quick-title-error' : undefined} />
            <button className="button button--primary quick-add__button" type="submit" disabled={pendingId === 'create'}>{pendingId === 'create' ? 'Adding…' : 'Add task'}</button>
          </div>
          {draftErrors.title && <span className="quick-error" id="quick-title-error" role="alert">{draftErrors.title}</span>}
          {composerOpen && (
            <div className="composer-details">
              <div className="field field--wide"><label htmlFor="new-note">Note <span>optional</span></label><textarea id="new-note" rows="2" maxLength="500" value={draft.note} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} /></div>
              <div className="field"><label htmlFor="new-date">Due date</label><input id="new-date" type="date" value={draft.dueDate} onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))} /></div>
              <div className="field"><label htmlFor="new-priority">Priority</label><select id="new-priority" value={draft.priority} onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value }))}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
              {draftErrors.form && <p className="form-error" role="alert">{draftErrors.form}</p>}
              <div className="form-actions"><button className="button button--quiet" type="button" onClick={() => { setComposerOpen(false); setDraft(emptyDraft()); setDraftErrors({}); }}>Cancel</button><button className="button button--primary" type="submit" disabled={pendingId === 'create'}>Create task</button></div>
            </div>
          )}
        </form>

        <section className="task-section" aria-labelledby="task-heading">
          <div className="task-toolbar">
            <div className="task-heading"><h2 id="task-heading">Today</h2><span>{active} active</span></div>
            <div className="task-controls">
              <label className="search-control"><Search aria-hidden="true" /><span className="sr-only">Search tasks</span><input type="search" placeholder="Search" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
              <div className="segmented" aria-label="Filter tasks">
                {['all', 'active', 'completed'].map((value) => <button key={value} type="button" className={filter === value ? 'is-active' : ''} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value[0].toUpperCase() + value.slice(1)}</button>)}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="state-panel" role="status"><span className="spinner" aria-hidden="true" /> Loading your tasks…</div>
          ) : loadError ? (
            <div className="state-panel state-panel--error" role="alert"><CircleAlert aria-hidden="true" /><div><h3>We couldn’t load your tasks</h3><p>{loadError}</p></div><button className="button" type="button" onClick={loadTasks}><RefreshCw aria-hidden="true" /> Retry</button></div>
          ) : visibleTasks.length === 0 ? (
            <EmptyState filtered={filtered} onAdd={openComposer} />
          ) : (
            <div className="task-list" aria-live="polite">
              {visibleTasks.map((task) => <TaskRow key={task.id} task={task} pending={pendingId === task.id} onToggle={toggleTask} onEdit={openEditor} onDelete={setDeleting} />)}
            </div>
          )}
        </section>
      </main>

      {editing && (
        <div className="overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
          <aside className="editor-panel" role="dialog" aria-modal="true" aria-labelledby="editor-heading">
            <div className="panel-header"><div><p className="eyebrow">Task details</p><h2 id="editor-heading">Edit task</h2></div><button className="icon-button" type="button" aria-label="Close task editor" onClick={() => setEditing(null)}><X aria-hidden="true" /></button></div>
            <form className="editor-form" onSubmit={saveEdit}>
              <TaskFields draft={editDraft} setDraft={setEditDraft} errors={editErrors} titleId="edit-title" titleRef={editorTitle} />
              {editErrors.form && <p className="form-error" role="alert">{editErrors.form}</p>}
              <div className="panel-actions"><button className="button button--quiet" type="button" onClick={() => setEditing(null)}>Cancel</button><button className="button button--primary" type="submit" disabled={pendingId === editing.id}>{pendingId === editing.id ? 'Saving…' : 'Save changes'}</button></div>
            </form>
          </aside>
        </div>
      )}

      {deleting && (
        <div className="overlay overlay--center" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleting(null); }}>
          <section className="delete-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-heading">
            <span className="delete-dialog__icon" aria-hidden="true"><Trash2 /></span>
            <h2 id="delete-heading">Delete this task?</h2>
            <p>“{deleting.title}” will be permanently removed.</p>
            <div className="dialog-actions"><button ref={deleteCancel} className="button button--quiet" type="button" onClick={() => setDeleting(null)}>Keep task</button><button className="button button--danger" type="button" onClick={deleteTask} disabled={pendingId === deleting.id}>{pendingId === deleting.id ? 'Deleting…' : 'Delete task'}</button></div>
          </section>
        </div>
      )}

      <div className={`toast${toast ? ' is-visible' : ''}`} role="status" aria-live="polite">{toast}</div>
    </div>
  );
}
