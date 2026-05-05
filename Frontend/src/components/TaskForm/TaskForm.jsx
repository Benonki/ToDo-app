import { useState } from "react";
import "./TaskForm.css";

export default function TaskForm({ onSubmit, onCancel, initialData = null, predefinedColors = [] }) {
    const [formData, setFormData] = useState({
        startTime: initialData?.startTime || "09:00",
        endTime: initialData?.endTime || "10:00",
        title: initialData?.title || "",
        description: initialData?.description || "",
        color: initialData?.color || predefinedColors[0]?.color || "#4A90E2"
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form className="task-form" onSubmit={handleSubmit}>
            <h3>{initialData ? 'Edytuj zadanie' : 'Nowe zadanie'}</h3>

            <div className="form-group">
                <label>Od:</label>
                <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    required
                />
            </div>

            <div className="form-group">
                <label>Do:</label>
                <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    required
                />
            </div>

            <div className="form-group">
                <label>Tytuł:</label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Nazwa zadania"
                    required
                />
            </div>

            <div className="form-group">
                <label>Opis:</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Opis zadania (opcjonalnie)"
                />
            </div>

            <div className="form-group">
                <label>Kolor:</label>
                <div className="color-picker">
                    {predefinedColors.map((colorOption) => (
                        <button
                            key={colorOption.id}
                            type="button"
                            className={`color-option ${formData.color === colorOption.color ? 'active' : ''}`}
                            style={{ backgroundColor: colorOption.color }}
                            onClick={() => setFormData({...formData, color: colorOption.color})}
                            title={colorOption.name}
                        />
                    ))}
                </div>
            </div>

            <div className="form-actions">
                <button type="submit" className="btn-save">
                    {initialData ? 'Zapisz zmiany' : 'Dodaj zadanie'}
                </button>
                <button type="button" className="btn-cancel" onClick={onCancel}>
                    Anuluj
                </button>
            </div>
        </form>
    );
}