import {useCallback, useRef, useState} from "react";
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
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectionStart, setSelectionStart] = useState(null);
    const [selectionEnd, setSelectionEnd] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [prefilledTime, setPrefilledTime] = useState(null);
    const timelineRef = useRef(null);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const getTimeFromYPosition = useCallback((yPosition) => {
        if (!timelineRef.current) return 0;
        const rect = timelineRef.current.getBoundingClientRect();
        const relativeY = yPosition - rect.top;
        const totalHeight = rect.height;
        const hoursFloat = (relativeY / totalHeight) * 24;
        const hours = Math.floor(hoursFloat);
        const minutes = Math.round((hoursFloat - hours) * 60);
        return { hours: Math.max(0, Math.min(23, hours)), minutes: Math.min(59, minutes) };
    }, []);

    const formatTimeNumber = (hours, minutes) => {
        const roundedMinutes = Math.round(minutes / 15) * 15;
        let finalHours = hours;
        let finalMinutes = roundedMinutes;

        if (finalMinutes >= 60) {
            finalHours += 1;
            finalMinutes = 0;
        }

        return {
            hours: Math.min(23, finalHours),
            minutes: finalMinutes
        };
    };

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

    const handleMouseDown = (e) => {
        if (e.target.closest('.task-block')) return;

        setIsDragging(true);
        setSelectionMode(true);
        const { hours, minutes } = getTimeFromYPosition(e.clientY);
        const rounded = formatTimeNumber(hours, minutes);
        const startTime = { hours: rounded.hours, minutes: rounded.minutes };
        setSelectionStart(startTime);
        setSelectionEnd(startTime);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;

        const { hours, minutes } = getTimeFromYPosition(e.clientY);
        const rounded = formatTimeNumber(hours, minutes);
        setSelectionEnd({ hours: rounded.hours, minutes: rounded.minutes });
    };

    const handleMouseUp = () => {
        if (!isDragging) return;
        setIsDragging(false);

        if (selectionStart && selectionEnd) {
            const startMinutes = selectionStart.hours * 60 + selectionStart.minutes;
            const endMinutes = selectionEnd.hours * 60 + selectionEnd.minutes;

            if (Math.abs(endMinutes - startMinutes) >= 15) {
                const [finalStart, finalEnd] = startMinutes <= endMinutes
                    ? [selectionStart, selectionEnd]
                    : [selectionEnd, selectionStart];

                setPrefilledTime({
                    startTime: `${finalStart.hours.toString().padStart(2, '0')}:${finalStart.minutes.toString().padStart(2, '0')}`,
                    endTime: `${finalEnd.hours.toString().padStart(2, '0')}:${finalEnd.minutes.toString().padStart(2, '0')}`
                });

                setEditingTask(null);
                setShowForm(true);
            }
        }

        setTimeout(() => {
            setSelectionMode(false);
            setSelectionStart(null);
            setSelectionEnd(null);
        }, 100);
    };

    const getSelectionStyle = () => {
        if (!selectionMode || !selectionStart || !selectionEnd) return null;

        const startMinutes = selectionStart.hours * 60 + selectionStart.minutes;
        const endMinutes = selectionEnd.hours * 60 + selectionEnd.minutes;

        const topPercent = Math.min(startMinutes, endMinutes) / (24 * 60) * 100;
        const heightPercent = Math.abs(endMinutes - startMinutes) / (24 * 60) * 100;

        return {
            top: `${topPercent}%`,
            height: `${heightPercent}%`,
            display: 'block'
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
        setPrefilledTime(null);
    };

    const handleTaskClick = (task) => {
        setEditingTask(task);
        setPrefilledTime(null);
        setShowForm(true);
    };

    const handleDeleteClick = async (taskId, e) => {
        e.stopPropagation();
        if (window.confirm('Czy na pewno chcesz usunąć to zadanie?')) {
            await onDeleteTask(date.toISOString(), taskId);
        }
    };

    const handleAddButtonClick = () => {
        setEditingTask(null);
        setPrefilledTime(null);
        setShowForm(!showForm);
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
                    onClick={handleAddButtonClick}
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
                        setPrefilledTime(null);
                    }}
                    predefinedColors={PREDEFINED_COLORS}
                    initialData={prefilledTime || (editingTask ? {
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
                    } : null)}
                />
            )}

            <div
                className="timeline-container"
                ref={timelineRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => {
                    if (isDragging) {
                        setIsDragging(false);
                        setSelectionMode(false);
                    }
                }}
            >
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

                    <div className="selection-overlay" style={getSelectionStyle()} />

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