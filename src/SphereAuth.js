import React, { useState } from 'react';
import './SphereAuth.css';

const SphereAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    avatar: null,
    banner: null,
    fullName: '',
    city: '',
    bio: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        [e.target.name]: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      console.log('Вход:', { username: formData.username, password: formData.password });
    } else {
      console.log('Регистрация:', formData);
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleTabSwitch = (login) => {
    setIsLogin(login);
    setCurrentStep(1);
  };

  const renderLoginForm = () => (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="input-group">
        <input
          type="text"
          name="username"
          placeholder="Имя пользователя"
          value={formData.username}
          onChange={handleChange}
          required
          className="auth-input"
        />
      </div>

      <div className="input-group">
        <input
          type="password"
          name="password"
          placeholder="Пароль"
          value={formData.password}
          onChange={handleChange}
          required
          className="auth-input"
        />
      </div>

      <button type="submit" className="auth-button">
        Войти
      </button>
    </form>
  );

  const renderRegistrationStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-form">
            <h3 className="step-title">Основная информация</h3>
            <div className="input-group">
              <input
                type="text"
                name="username"
                placeholder="Имя пользователя"
                value={formData.username}
                onChange={handleChange}
                required
                className="auth-input"
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder="Пароль"
                value={formData.password}
                onChange={handleChange}
                required
                className="auth-input"
              />
            </div>
            <button onClick={nextStep} className="auth-button next-button">
              Продолжить
            </button>
          </div>
        );

      case 2:
        return (
          <div className="step-form">
            <h3 className="step-title">Профиль</h3>
            <div className="file-upload-group">
              <label className="file-label">
                <span>Аватарка</span>
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                {formData.avatar && (
                  <img src={formData.avatar} alt="Avatar preview" className="image-preview" />
                )}
              </label>
            </div>
            <div className="file-upload-group">
              <label className="file-label">
                <span>Баннер</span>
                <input
                  type="file"
                  name="banner"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                {formData.banner && (
                  <img src={formData.banner} alt="Banner preview" className="image-preview banner-preview" />
                )}
              </label>
            </div>
            <div className="step-buttons">
              <button onClick={prevStep} className="auth-button secondary">
                Назад
              </button>
              <button onClick={nextStep} className="auth-button next-button">
                Продолжить
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-form">
            <h3 className="step-title">Дополнительная информация</h3>
            <div className="input-group">
              <input
                type="text"
                name="fullName"
                placeholder="Полное имя"
                value={formData.fullName}
                onChange={handleChange}
                className="auth-input"
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="city"
                placeholder="Город"
                value={formData.city}
                onChange={handleChange}
                className="auth-input"
              />
            </div>
            <div className="input-group">
              <textarea
                name="bio"
                placeholder="О себе"
                value={formData.bio}
                onChange={handleChange}
                className="auth-input textarea"
                rows="3"
              />
            </div>
            <div className="step-buttons">
              <button onClick={prevStep} className="auth-button secondary">
                Назад
              </button>
              <button type="submit" className="auth-button">
                Зарегистрироваться
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="sphere-auth">
      <div className="auth-container">
        <div className="logo">
          <h1>Sphere</h1>
        </div>

        <div className="form-wrapper">
          <div className="form-header">
            <button 
              className={`tab-button ${isLogin ? 'active' : ''}`}
              onClick={() => handleTabSwitch(true)}
            >
              Вход
            </button>
            <button 
              className={`tab-button ${!isLogin ? 'active' : ''}`}
              onClick={() => handleTabSwitch(false)}
            >
              Регистрация
            </button>
          </div>

          {!isLogin && (
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
              <div className="progress-steps">
                <span className={`step-dot ${currentStep >= 1 ? 'active' : ''}`}>1</span>
                <span className={`step-dot ${currentStep >= 2 ? 'active' : ''}`}>2</span>
                <span className={`step-dot ${currentStep >= 3 ? 'active' : ''}`}>3</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isLogin ? renderLoginForm() : renderRegistrationStep()}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SphereAuth;