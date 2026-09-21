import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App.jsx';
import { taskApi } from './api.js';

vi.mock('./api.js', () => ({
  taskApi: { list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));

const activeTask = {
  id: 'a1', title: 'Finalize API contract', note: 'Confirm shapes', priority: 'high', dueDate: null,
  completed: false, completedAt: null, createdAt: '2026-09-20T10:00:00Z', updatedAt: '2026-09-20T10:00:00Z',
};
const doneTask = {
  id: 'b2', title: 'Review wireframes', note: '', priority: 'medium', dueDate: null,
  completed: true, completedAt: '2026-09-20T11:00:00Z', createdAt: '2026-09-19T10:00:00Z', updatedAt: '2026-09-20T11:00:00Z',
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    taskApi.list.mockResolvedValue([activeTask, doneTask]);
  });

  it('renders persisted tasks, progress, filters, and search', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByText(/Loading your tasks/)).toBeInTheDocument();
    expect(await screen.findByText('Finalize API contract')).toBeInTheDocument();
    expect(screen.getByText('1 of 2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Completed' }));
    expect(screen.queryByText('Finalize API contract')).not.toBeInTheDocument();
    expect(screen.getByText('Review wireframes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'All' }));
    await user.type(screen.getByRole('searchbox', { name: 'Search tasks' }), 'shapes');
    expect(screen.getByText('Finalize API contract')).toBeInTheDocument();
    expect(screen.queryByText('Review wireframes')).not.toBeInTheDocument();
  });

  it('creates a task and resets the composer', async () => {
    const user = userEvent.setup();
    const created = { ...activeTask, id: 'c3', title: 'Ship README', note: '', priority: 'medium' };
    taskApi.create.mockResolvedValue(created);
    render(<App />);
    await screen.findByText('Finalize API contract');

    const title = screen.getByRole('textbox', { name: 'Task title' });
    await user.type(title, 'Ship README');
    await user.click(screen.getByRole('button', { name: 'Create task' }));
    await waitFor(() => expect(taskApi.create).toHaveBeenCalledWith({ title: 'Ship README', note: '', priority: 'medium', dueDate: null }));
    expect(screen.getByText('Ship README')).toBeInTheDocument();
    expect(title).toHaveValue('');
  });

  it('validates an empty task title without calling the API', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Finalize API contract');
    await user.click(screen.getByRole('textbox', { name: 'Task title' }));
    await user.click(screen.getByRole('button', { name: 'Create task' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a task title');
    expect(taskApi.create).not.toHaveBeenCalled();
  });

  it('completes and reopens a task', async () => {
    const user = userEvent.setup();
    taskApi.update
      .mockResolvedValueOnce({ ...activeTask, completed: true, completedAt: '2026-09-20T12:00:00Z' })
      .mockResolvedValueOnce({ ...activeTask, completed: false, completedAt: null });
    render(<App />);
    await screen.findByText('Finalize API contract');

    await user.click(screen.getByRole('button', { name: 'Mark Finalize API contract complete' }));
    expect(await screen.findByRole('button', { name: 'Reopen Finalize API contract' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reopen Finalize API contract' }));
    expect(await screen.findByRole('button', { name: 'Mark Finalize API contract complete' })).toBeInTheDocument();
  });

  it('edits a task and saves changed fields', async () => {
    const user = userEvent.setup();
    taskApi.update.mockResolvedValue({ ...activeTask, title: 'Final API contract', priority: 'medium' });
    render(<App />);
    await screen.findByText('Finalize API contract');
    await user.click(screen.getByRole('button', { name: 'Edit Finalize API contract' }));

    const dialog = screen.getByRole('dialog', { name: 'Edit task' });
    const title = within(dialog).getByRole('textbox', { name: 'Title' });
    await user.clear(title);
    await user.type(title, 'Final API contract');
    await user.selectOptions(within(dialog).getByRole('combobox', { name: 'Priority' }), 'medium');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(taskApi.update).toHaveBeenCalledWith('a1', expect.objectContaining({ title: 'Final API contract', priority: 'medium' })));
    expect(screen.getByText('Final API contract')).toBeInTheDocument();
  });

  it('requires confirmation before deleting', async () => {
    const user = userEvent.setup();
    taskApi.remove.mockResolvedValue();
    render(<App />);
    await screen.findByText('Finalize API contract');
    await user.click(screen.getByRole('button', { name: 'Delete Finalize API contract' }));
    const dialog = screen.getByRole('dialog', { name: 'Delete this task?' });
    expect(dialog).toHaveTextContent('Finalize API contract');
    expect(taskApi.remove).not.toHaveBeenCalled();
    await user.click(within(dialog).getByRole('button', { name: 'Delete task' }));
    await waitFor(() => expect(taskApi.remove).toHaveBeenCalledWith('a1'));
    expect(screen.queryByText('Finalize API contract')).not.toBeInTheDocument();
  });

  it('shows a recoverable load error and retries', async () => {
    const user = userEvent.setup();
    taskApi.list.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce([]);
    render(<App />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Offline');
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('Nothing on your list')).toBeInTheDocument();
    expect(taskApi.list).toHaveBeenCalledTimes(2);
  });
});
