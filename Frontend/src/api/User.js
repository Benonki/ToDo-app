import { apiFetch } from '../services/api';

export async function getProfile() {
    return apiFetch('/users/profile');
}

export async function updateProfile(info) {
    return apiFetch('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({
            info
        })
    });
}