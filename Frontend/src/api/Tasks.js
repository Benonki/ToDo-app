import { apiFetch } from '../services/api';

export async function getTasks(date) {
    return apiFetch(`/tasks?date=${date}`);
}

export async function createTask(taskData) {
    return apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData)
    });
}

export async function updateTask(taskId, taskData) {
    return apiFetch(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(taskData)
    });
}

export async function deleteTask(date, taskId) {
    return apiFetch(`/tasks/${date}/${taskId}`, {
        method: 'DELETE'
    });
}