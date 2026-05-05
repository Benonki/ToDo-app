import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import DayTimeline from "../../components/DayTimeline/DayTimeline";
import { getTasks, createTask, updateTask, deleteTask } from "../../api/tasks";
import "react-calendar/dist/Calendar.css";
import "./calendar.css";
import "./index.css";

export default function Home() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadTasks(selectedDate);
    }, [selectedDate]);

    const loadTasks = async (date) => {
        setLoading(true);
        try {
            const data = await getTasks(date.toISOString().split('T')[0]);
            setTasks(data.tasks || []);
        } catch (error) {
            console.error('Error loading tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (taskData) => {
        try {
            await createTask(taskData);
            await loadTasks(selectedDate);
        } catch (error) {
            console.error('Error adding task:', error);
            alert('Nie udało się dodać zadania');
        }
    };

    const handleUpdateTask = async (taskId, taskData) => {
        try {
            await updateTask(taskId, taskData);
            await loadTasks(selectedDate);
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Nie udało się zaktualizować zadania');
        }
    };

    const handleDeleteTask = async (date, taskId) => {
        try {
            await deleteTask(date, taskId);
            await loadTasks(selectedDate);
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Nie udało się usunąć zadania');
        }
    };

    return (
        <div className="home-container">
            <div className="wrapper">
                <Calendar
                    onChange={(value) => value instanceof Date && setSelectedDate(value)}
                    value={selectedDate}
                    locale="pl-PL"
                />

                <div className="details">
                    <h2 className="weekday">
                        {selectedDate.toLocaleDateString("pl-PL", {
                            weekday: "long",
                        })}
                    </h2>

                    <h1 className="day">
                        {selectedDate.toLocaleDateString("pl-PL", {
                            day: "numeric",
                            month: "long",
                        })}
                    </h1>

                    <p className="year">{selectedDate.getFullYear()}</p>
                </div>
            </div>

            {loading ? (
                <div className="loading">Ładowanie zadań...</div>
            ) : (
                <DayTimeline
                    date={selectedDate}
                    tasks={tasks}
                    onAddTask={handleAddTask}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                />
            )}
        </div>
    );
}