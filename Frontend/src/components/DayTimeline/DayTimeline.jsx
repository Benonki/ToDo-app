import { useState } from "react";
import TaskForm from "../TaskForm/TaskForm.jsx";
import "./DayTimeline.css";

const PREDEFINED_COLORS = [
    { id: 1, color: '#4A90E2', name: 'Niebieski' },
    { id: 2, color: '#E25C5C', name: 'Czerwony' },
    { id: 3, color: '#5CE27C', name: 'Zielony' },
    { id: 4, color: '#E2C85C', name: 'Złoty' },
    { id: 5, color: '#9B5CE2', name: 'Fioletowy' }
];

export default function DayTimeline({ date, tasks, onAddTask, onUpdateTask, onDeleteTask }) {
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const getTaskStyle = (task) => {
        const startHour = new Date(task.startTime).getHours() + new Date(task.startTime).getMinutes() / 60;
        const endHour = new Date(task.endTime).getHours() + new Date(task.endTime).getMinutes() / 60;
        const duration = endHour - startHour;

        return {
            top: `${(startHour / 24) * 100}%`,
            height: `${(duration / 24) * 100}%`,
            backgroundColor: task.color || '#4A90E2'
        };
    };

    const handleFormSubmit = async (formData) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
        const [endHours, endMinutes] = formData.endTime.split(':').map(Number);

        const startTime = new Date(year, month, day, startHours, startMinutes);
        const endTime = new Date(year, month, day, endHours, endMinutes);

        const taskData = {
            date: new Date(year, month, day).toISOString(),
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            title: formData.title,
            description: formData.description,
            color: formData.color
        };

        if (editingTask) {
            await onUpdateTask(editingTask._id, taskData);
        } else {
            await onAddTask(taskData);
        }

        setShowForm(false);
        setEditingTask(null);
    };

    const handleTaskClick = (task) => {
        setEditingTask(task);
        setShowForm(true);
    };

    const handleDeleteClick = async (taskId, e) => {
        e.stopPropagation();
        if (window.confirm('Czy na pewno chcesz usunąć to zadanie?')) {
            await onDeleteTask(date.toISOString(), taskId);
        }
    };

    return (
        <div className="day-timeline">
            <div className="timeline-header">
                <h3>
                    Zadania na {date.toLocaleDateString('pl-PL', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                })}
                </h3>
                <button
                    className="btn-add"
                    onClick={() => {
                        setEditingTask(null);
                        setShowForm(!showForm);
                    }}
                >
                    {showForm ? 'Zamknij' : '+ Dodaj zadanie'}
                </button>
            </div>

            {showForm && (
                <TaskForm
                    onSubmit={handleFormSubmit}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingTask(null);
                    }}
                    predefinedColors={PREDEFINED_COLORS}
                    initialData={editingTask ? {
                        startTime: new Date(editingTask.startTime).toLocaleTimeString('pl-PL', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        }),
                        endTime: new Date(editingTask.endTime).toLocaleTimeString('pl-PL', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        }),
                        title: editingTask.title,
                        description: editingTask.description,
                        color: editingTask.color
                    } : null}
                />
            )}

            <div className="timeline-container">
                <div className="time-labels">
                    {hours.map(hour => (
                        <div key={hour} className="hour-label">
                            {hour.toString().padStart(2, '0')}:00
                        </div>
                    ))}
                </div>

                <div className="timeline-slots">
                    {hours.map(hour => (
                        <div key={hour} className="hour-slot" />
                    ))}

                    <div className="tasks-overlay">
                        {tasks.map((task, index) => (
                            <div
                                key={task._id || index}
                                className="task-block"
                                style={getTaskStyle(task)}
                                onClick={() => handleTaskClick(task)}
                            >
                                <div className="task-content">
                                    <span className="task-time">
                                        {new Date(task.startTime).toLocaleTimeString('pl-PL', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })} - {new Date(task.endTime).toLocaleTimeString('pl-PL', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                    </span>
                                    <span className="task-title">{task.title}</span>
                                    {task.description && (
                                        <span className="task-desc">{task.description}</span>
                                    )}
                                </div>
                                <button
                                    className="btn-delete"
                                    onClick={(e) => handleDeleteClick(task._id, e)}
                                    title="Usuń zadanie"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}