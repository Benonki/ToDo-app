import { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../../api/User';
import './index.css';

function Profile() {
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError('');

        const response = await getProfile();
        const loadedUser = response.user;

        setUser(loadedUser);

        setFormData({
          firstName: loadedUser.info?.firstName || 'ImieTest',
          lastName: loadedUser.info?.lastName || 'NazTest'
        });
      } catch (err) {
        setError(err.message || 'Nie udało się pobrać profilu');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Imię i nazwisko są wymagane');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const response = await updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim()
      });

      setUser(response.user);
      setIsEditing(false);
      setMessage('Profil został zaktualizowany');
    } catch (err) {
      setError(err.message || 'Nie udało się zaktualizować profilu');
    } finally {
      setSaving(false);
    }
  }

  function handleEdit() {
    setMessage('');
    setError('');
    setIsEditing(true);
  }

  function handleCancel() {
    if (user) {
      setFormData({
        firstName: user.info?.firstName || 'ImieTest',
        lastName: user.info?.lastName || 'NazTest'
      });
    }

    setIsEditing(false);
    setError('');
    setMessage('');
  }

  if (loading) {
    return (
        <main className="profile-page">
          <section className="profile-card">
            <p className="profile-loading">Ładowanie profilu...</p>
          </section>
        </main>
    );
  }

  return (
      <main className="profile-page">
        <section className="profile-card">
          <header className="profile-header">
            <div className="profile-avatar">
              {(user?.info?.firstName?.[0] || 'U').toUpperCase()}
            </div>

            <div>
              <h1 className="profile-title">Profil użytkownika</h1>
              <p className="profile-subtitle">
                Zarządzaj podstawowymi danymi swojego konta.
              </p>
            </div>
          </header>

          {error && (
              <p className="profile-alert profile-alert-error">
                {error}
              </p>
          )}

          {message && (
              <p className="profile-alert profile-alert-success">
                {message}
              </p>
          )}

          {!isEditing ? (
              <div className="profile-content">
                <div className="profile-info-grid">
                  <div className="profile-info-item">
                    <span className="profile-label">Imię</span>
                    <strong className="profile-value">
                      {user?.info?.firstName || 'ImieTest'}
                    </strong>
                  </div>

                  <div className="profile-info-item">
                    <span className="profile-label">Nazwisko</span>
                    <strong className="profile-value">
                      {user?.info?.lastName || 'NazTest'}
                    </strong>
                  </div>

                  <div className="profile-info-item profile-info-item-full">
                    <span className="profile-label">Adres e-mail</span>
                    <strong className="profile-value">
                      {user?.email || 'Brak adresu e-mail'}
                    </strong>
                  </div>
                </div>

                <button
                    type="button"
                    className="profile-button profile-button-primary"
                    onClick={handleEdit}
                >
                  Edytuj profil
                </button>
              </div>
          ) : (
              <form className="profile-form" onSubmit={handleSubmit}>
                <div className="profile-form-group">
                  <label className="profile-label" htmlFor="firstName">
                    Imię
                  </label>
                  <input
                      id="firstName"
                      className="profile-input"
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Podaj imię"
                  />
                </div>

                <div className="profile-form-group">
                  <label className="profile-label" htmlFor="lastName">
                    Nazwisko
                  </label>
                  <input
                      id="lastName"
                      className="profile-input"
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Podaj nazwisko"
                  />
                </div>

                <div className="profile-actions">
                  <button
                      type="submit"
                      className="profile-button profile-button-primary"
                      disabled={saving}
                  >
                    {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
                  </button>

                  <button
                      type="button"
                      className="profile-button profile-button-secondary"
                      onClick={handleCancel}
                      disabled={saving}
                  >
                    Anuluj
                  </button>
                </div>
              </form>
          )}
        </section>
      </main>
  );
}

export default Profile;