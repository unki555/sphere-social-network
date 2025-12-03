import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import { createClient } from '@supabase/supabase-js';
import {
  HomeIcon,
  SearchIcon,
  UserIcon,
  SettingsIcon,
  LogoutIcon,
  PlusIcon,
  LikeIcon,
  CommentIcon,
  ShareIcon,
  MoreIcon,
  CameraIcon,
  CloseIcon,
  EditIcon,
  FriendsIcon,
  MessageIcon,
  NotificationIcon,
  GlobeIcon,
  MusicIcon,
  VideoIcon,
  PhotoIcon,
  SaveIcon,
  ArrowLeftIcon,
  HeartIcon,
  UsersIcon,
  ImageIcon,
  FileTextIcon,
  PaletteIcon,
  LanguageIcon,
  BellIcon,
  LockIcon,
  EyeIcon,
  CheckIcon
} from './icons';

// Инициализация Supabase клиента
const supabaseUrl = 'https://gffmbygfcwjkjnkorcxl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZm1ieWdmY3dqa2pua29yY3hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTk4MDgsImV4cCI6MjA4MDE3NTgwOH0.hOUAK_UcqmBDJgDQtjgE0wBjCeBxws6--5_m4h2KaMw';
const supabase = createClient(supabaseUrl, supabaseKey);

// Компонент аутентификации с регистрацией
// Обновленный App.js - исправления в компоненте AuthComponent

// Компонент аутентификации с регистрацией
// Обновленный компонент аутентификации
const AuthComponent = ({ onLogin, user }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    avatar: null,
    bio: '',
    city: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateLoginForm = () => {
    if (!formData.username.trim()) {
      setError('Введите имя пользователя');
      return false;
    }
    if (!formData.password.trim()) {
      setError('Введите пароль');
      return false;
    }
    return true;
  };

  const validateRegisterStep1 = () => {
    if (!formData.username.trim()) {
      setError('Введите имя пользователя');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Введите email');
      return false;
    }
    if (!formData.password.trim()) {
      setError('Введите пароль');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateRegisterStep1()) {
      setStep(2);
      setError('');
    }
  };

  const prevStep = () => {
    setStep(1);
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateLoginForm()) {
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      console.log('Пытаюсь войти с username:', formData.username);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', formData.username)
        .single();
      
      console.log('Результат запроса:', { data, error });
      
      if (error) {
        console.error('Supabase error:', error);
        if (error.code === 'PGRST116') {
          setError('Пользователь не найден');
        } else if (error.message.includes('does not exist')) {
          setError('Таблица users не существует. Создайте тестового пользователя.');
          // Создаем тестового пользователя для демо
          createTestUser();
          return;
        } else {
          setError('Ошибка входа: ' + error.message);
        }
        setIsLoading(false);
        return;
      }
      
      if (!data) {
        setError('Пользователь не найден');
        setIsLoading(false);
        return;
      }
      
      if (data.password !== formData.password) {
        setError('Неверный пароль');
        setIsLoading(false);
        return;
      }
      
      console.log('Успешный вход:', data);
      
      onLogin({
        id: data.id,
        username: data.username,
        email: data.email || '',
        avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
        avatarType: data.avatar_type || 'image',
        fullName: data.full_name || data.username,
        bio: data.bio || '',
        city: data.city || '',
        banner: data.banner,
        followers: data.followers || 0,
        following: data.following || 0,
        posts: data.posts || 0,
        isOnline: true,
        theme: data.theme || 'light',
        language: data.language || 'ru'
      });
      
    } catch (error) {
      console.error('Login error:', error);
      setError('Ошибка входа: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createTestUser = async () => {
    try {
      console.log('Создаю тестового пользователя...');
      
      // Сначала проверяем, существует ли таблица users
      const { error: tableError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (tableError && tableError.message.includes('does not exist')) {
        setError('Таблица users не существует. Создайте таблицу в Supabase SQL Editor.');
        return;
      }
      
      // Создаем тестового пользователя
      const testUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123456',
        full_name: 'Тестовый Пользователь',
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('users')
        .insert([testUser])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating test user:', error);
        setError('Не удалось создать тестового пользователя: ' + error.message);
        return;
      }
      
      console.log('Тестовый пользователь создан:', data);
      
      // Пробуем войти с тестовыми данными
      setFormData({
        ...formData,
        username: 'testuser',
        password: '123456'
      });
      
      // Ждем немного и пробуем войти
      setTimeout(() => {
        handleLoginSubmit(new Event('submit'));
      }, 1000);
      
    } catch (error) {
      console.error('Create test user error:', error);
      setError('Ошибка создания тестового пользователя');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateRegisterStep1()) {
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      console.log('Регистрирую пользователя:', formData.username);
      
      // Проверяем существование пользователя
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('username, email')
        .or(`username.eq.${formData.username},email.eq.${formData.email}`);
      
      if (checkError) {
        console.error('Check error:', checkError);
        if (checkError.message.includes('does not exist')) {
          setError('Таблица users не существует. Создайте таблицу в Supabase.');
          setIsLoading(false);
          return;
        }
      }
      
      if (existingUsers && existingUsers.length > 0) {
        const existingUser = existingUsers[0];
        if (existingUser.username === formData.username) {
          setError('Имя пользователя уже занято');
        } else if (existingUser.email === formData.email) {
          setError('Email уже используется');
        }
        setIsLoading(false);
        return;
      }
      
      // Создаем пользователя
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName || formData.username,
        bio: formData.bio || null,
        city: formData.city || null,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();
      
      if (error) {
        console.error('Register error:', error);
        setError('Ошибка регистрации: ' + error.message);
        setIsLoading(false);
        return;
      }
      
      console.log('Пользователь создан:', data);
      
      onLogin({
        id: data.id,
        username: data.username,
        email: data.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
        avatarType: 'image',
        fullName: data.full_name || data.username,
        bio: data.bio || '',
        city: data.city || '',
        followers: 0,
        following: 0,
        posts: 0,
        isOnline: true,
        theme: 'light',
        language: 'ru'
      });
      
    } catch (error) {
      console.error('Register error:', error);
      setError('Ошибка регистрации: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (user) return null;

  const renderLoginForm = () => (
    <form onSubmit={handleLoginSubmit} className="auth-form">
      <div className="input-group">
        <input
          type="text"
          name="username"
          placeholder="Имя пользователя"
          value={formData.username}
          onChange={handleChange}
          required
          className="auth-input"
          disabled={isLoading}
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
          disabled={isLoading}
        />
      </div>
      <button 
        type="submit" 
        className="auth-button"
        disabled={isLoading}
      >
        {isLoading ? 'Вход...' : 'Войти'}
      </button>
      
      {/* Тестовые данные для быстрого входа */}
      <div className="test-credentials">
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px' }}>
          Для теста: username: <strong>testuser</strong>, password: <strong>123456</strong>
        </p>
      </div>
    </form>
  );

  const renderRegisterStep1 = () => (
    <div className="auth-step">
      <div className="input-group">
        <input
          type="text"
          name="username"
          placeholder="Имя пользователя"
          value={formData.username}
          onChange={handleChange}
          required
          className="auth-input"
          disabled={isLoading}
        />
      </div>
      <div className="input-group">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="auth-input"
          disabled={isLoading}
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
          disabled={isLoading}
        />
      </div>
      <div className="input-group">
        <input
          type="password"
          name="confirmPassword"
          placeholder="Подтвердите пароль"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="auth-input"
          disabled={isLoading}
        />
      </div>
      <button 
        type="button"
        onClick={nextStep}
        className="auth-button"
        disabled={isLoading}
      >
        Продолжить
      </button>
    </div>
  );

  const renderRegisterStep2 = () => (
    <div className="auth-step">
      <div className="input-group">
        <input
          type="text"
          name="fullName"
          placeholder="Полное имя (необязательно)"
          value={formData.fullName}
          onChange={handleChange}
          className="auth-input"
          disabled={isLoading}
        />
      </div>
      <div className="input-group">
        <input
          type="text"
          name="city"
          placeholder="Город (необязательно)"
          value={formData.city}
          onChange={handleChange}
          className="auth-input"
          disabled={isLoading}
        />
      </div>
      <div className="input-group">
        <textarea
          name="bio"
          placeholder="О себе (необязательно)"
          value={formData.bio}
          onChange={handleChange}
          className="auth-input"
          rows="3"
          disabled={isLoading}
        />
      </div>
      <div className="file-upload-group">
        <label className="file-upload-label">
          <span>Загрузить аватар (необязательно)</span>
          <input
            type="file"
            name="avatar"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="file-input"
            disabled={isLoading}
          />
          <div className="file-upload-btn">Выбрать файл</div>
        </label>
      </div>
      <div className="auth-step-buttons">
        <button 
          type="button"
          onClick={prevStep}
          className="auth-button secondary"
          disabled={isLoading}
        >
          Назад
        </button>
        <button 
          type="submit"
          className="auth-button"
          disabled={isLoading}
        >
          {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="sphere-auth">
      <div className="auth-container">
        <div className="logo">
          <h1>Sphere</h1>
          <p>Ваша социальная сеть</p>
        </div>

        <div className="form-wrapper">
          <div className="form-header">
            <button 
              className={`tab-button ${isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(true);
                setStep(1);
                setError('');
              }}
              disabled={isLoading}
            >
              Вход
            </button>
            <button 
              className={`tab-button ${!isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(false);
                setStep(1);
                setError('');
                // Сбрасываем форму при переключении
                setFormData({
                  username: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  fullName: '',
                  avatar: null,
                  bio: '',
                  city: ''
                });
              }}
              disabled={isLoading}
            >
              Регистрация
            </button>
          </div>

          {!isLogin && (
            <div className="auth-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${step === 1 ? 50 : 100}%` }}
                ></div>
              </div>
              <div className="progress-steps">
                <span className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</span>
                <span className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</span>
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {isLogin ? (
            renderLoginForm()
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              {step === 1 ? renderRegisterStep1() : renderRegisterStep2()}
            </form>
          )}

          <div className="auth-footer">
            {isLogin ? (
              <p>
                Нет аккаунта?{' '}
                <button 
                  type="button" 
                  onClick={() => {
                    setIsLogin(false);
                    setStep(1);
                    setError('');
                  }}
                  className="auth-link"
                >
                  Зарегистрироваться
                </button>
              </p>
            ) : (
              <p>
                Уже есть аккаунт?{' '}
                <button 
                  type="button" 
                  onClick={() => {
                    setIsLogin(true);
                    setStep(1);
                    setError('');
                  }}
                  className="auth-link"
                >
                  Войти
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Компонент бокового меню
const Sidebar = ({ user, activeTab, onTabChange, onCreatePost, onShowProfile, onLogout }) => {
  const navItems = [
    { id: 'home', icon: HomeIcon, label: 'Главная' },
    { id: 'friends', icon: FriendsIcon, label: 'Друзья' },
    { id: 'messages', icon: MessageIcon, label: 'Сообщения' },
    { id: 'notifications', icon: NotificationIcon, label: 'Уведомления' },
  ];

  return (
    <aside className="sidebar desktop-only">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <h2>Sphere</h2>
        </div>
        <button className="create-post-btn-sidebar" onClick={onCreatePost}>
          <PlusIcon size={20} />
          <span>Создать пост</span>
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <item.icon size={24} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-sidebar" onClick={onShowProfile}>
          <div className="user-avatar-sidebar">
            {user.avatarType === 'video' ? (
              <video src={user.avatar} className="avatar-media" muted autoPlay loop />
            ) : (
              <img src={user.avatar} alt={user.username} className="avatar-media" />
            )}
            <div className={`online-status ${user.isOnline ? 'online' : 'offline'}`}></div>
          </div>
          <div className="user-info-sidebar">
            <h4>{user.fullName}</h4>
            <p>@{user.username}</p>
          </div>
        </div>
        
        <div className="sidebar-actions">
          <button className="sidebar-action-btn" onClick={() => onTabChange('settings')}>
            <SettingsIcon size={20} />
          </button>
          <button className="sidebar-action-btn" onClick={onLogout}>
            <LogoutIcon size={20} />
          </button>
        </div>
      </div>
    </aside>
  );
};

// Компонент поиска
const SearchComponent = ({ onClose, user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('username', `%${query}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      // Добавление в подписки
      const { error } = await supabase
        .from('followers')
        .insert([
          {
            follower_id: user.id,
            following_id: userId
          }
        ]);

      if (error) throw error;
      
      // Обновление результатов поиска
      setSearchResults(results => 
        results.map(u => 
          u.id === userId ? { ...u, isFollowing: true } : u
        )
      );
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;
      
      setSearchResults(results => 
        results.map(u => 
          u.id === userId ? { ...u, isFollowing: false } : u
        )
      );
    } catch (error) {
      console.error('Unfollow error:', error);
    }
  };

  return (
    <div className="search-overlay">
      <div className="search-header">
        <div className="search-input-container">
          <SearchIcon size={20} />
          <input
            type="text"
            placeholder="Поиск пользователей..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
            autoFocus
          />
          {isLoading && <div className="search-loading">Загрузка...</div>}
        </div>
        <button className="close-search" onClick={onClose}>
          <CloseIcon size={20} />
        </button>
      </div>
      
      <div className="search-results">
        {searchQuery ? (
          searchResults.length > 0 ? (
            <div className="users-list">
              {searchResults.map(user => (
                <div key={user.id} className="user-search-item">
                  <img 
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                    alt={user.username} 
                    className="user-search-avatar" 
                  />
                  <div className="user-search-info">
                    <h4>{user.full_name || user.username}</h4>
                    <p>@{user.username}</p>
                    {user.bio && <p className="user-search-bio">{user.bio}</p>}
                  </div>
                  <button 
                    className={`follow-btn ${user.isFollowing ? 'following' : ''}`}
                    onClick={() => user.isFollowing ? handleUnfollow(user.id) : handleFollow(user.id)}
                  >
                    {user.isFollowing ? 'Отписаться' : 'Подписаться'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>Пользователи не найдены</p>
            </div>
          )
        ) : (
          <div className="search-placeholder">
            <SearchIcon size={48} />
            <p>Начните вводить для поиска пользователей</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Компонент настроек
const SettingsComponent = ({ user, onClose, onUpdateUser }) => {
  const [settings, setSettings] = useState({
    theme: user.theme || 'light',
    language: user.language || 'ru',
    notifications: true,
    privateAccount: false,
    showOnlineStatus: true
  });
  const [isSaving, setIsSaving] = useState(false);

  const themes = [
    { id: 'light', name: 'Светлая', color: '#ffffff' },
    { id: 'dark', name: 'Темная', color: '#000000' },
    { id: 'blue', name: 'Синяя', color: '#2196F3' },
    { id: 'green', name: 'Зеленая', color: '#4CAF50' },
    { id: 'purple', name: 'Фиолетовая', color: '#9C27B0' },
  ];

  const languages = [
    { id: 'ru', name: 'Русский' },
    { id: 'en', name: 'English' },
    { id: 'es', name: 'Español' },
    { id: 'fr', name: 'Français' },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          theme: settings.theme,
          language: settings.language
        })
        .eq('id', user.id);

      if (error) throw error;
      
      onUpdateUser({
        ...user,
        theme: settings.theme,
        language: settings.language
      });
      
      // Применяем тему
      document.documentElement.setAttribute('data-theme', settings.theme);
      
      alert('Настройки сохранены!');
    } catch (error) {
      console.error('Save settings error:', error);
      alert('Ошибка сохранения настроек');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="settings-overlay">
      <div className="settings-header">
        <button className="back-button" onClick={onClose}>
          <ArrowLeftIcon size={20} />
        </button>
        <h2>Настройки</h2>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h3><PaletteIcon size={18} /> Тема</h3>
          <div className="theme-selector">
            {themes.map(theme => (
              <button
                key={theme.id}
                className={`theme-option ${settings.theme === theme.id ? 'active' : ''}`}
                onClick={() => setSettings({...settings, theme: theme.id})}
                style={{ 
                  backgroundColor: theme.color,
                  borderColor: theme.color === '#ffffff' ? '#e0e0e0' : theme.color
                }}
              >
                {settings.theme === theme.id && <CheckIcon size={16} color={theme.color === '#ffffff' ? '#000' : '#fff'} />}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <h3><LanguageIcon size={18} /> Язык</h3>
          <div className="language-selector">
            {languages.map(lang => (
              <button
                key={lang.id}
                className={`language-option ${settings.language === lang.id ? 'active' : ''}`}
                onClick={() => setSettings({...settings, language: lang.id})}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <h3><BellIcon size={18} /> Уведомления</h3>
          <div className="settings-list">
            <div className="setting-item">
              <span>Push-уведомления</span>
              <div className="toggle-switch">
                <input 
                  type="checkbox" 
                  id="notifications" 
                  checked={settings.notifications}
                  onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                />
                <label htmlFor="notifications"></label>
              </div>
            </div>
            <div className="setting-item">
              <span>Приватный аккаунт</span>
              <div className="toggle-switch">
                <input 
                  type="checkbox" 
                  id="private" 
                  checked={settings.privateAccount}
                  onChange={(e) => setSettings({...settings, privateAccount: e.target.checked})}
                />
                <label htmlFor="private"></label>
              </div>
            </div>
            <div className="setting-item">
              <span>Показывать онлайн статус</span>
              <div className="toggle-switch">
                <input 
                  type="checkbox" 
                  id="online-status" 
                  checked={settings.showOnlineStatus}
                  onChange={(e) => setSettings({...settings, showOnlineStatus: e.target.checked})}
                />
                <label htmlFor="online-status"></label>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3><LockIcon size={18} /> Безопасность</h3>
          <button className="settings-btn">Сменить пароль</button>
          <button className="settings-btn">Двухфакторная аутентификация</button>
        </div>

        <button 
          className="save-settings-btn"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Сохранение...' : 'Сохранить настройки'}
        </button>
      </div>
    </div>
  );
};

// Компонент профиля
const ProfileComponent = ({ user, onClose, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fullName: user.fullName || '',
    username: user.username || '',
    bio: user.bio || '',
    city: user.city || '',
    avatar: user.avatar || '',
    avatarType: user.avatarType || 'image',
    banner: user.banner || '',
    bannerType: user.bannerType || 'image'
  });
  const [userPosts, setUserPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
  fetchUserData();
}, [fetchUserData]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      // Загрузка постов пользователя
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Загрузка подписчиков
      const { data: followersData } = await supabase
        .from('followers')
        .select(`
          follower:users!follower_id(*)
        `)
        .eq('following_id', user.id);

      // Загрузка подписок
      const { data: followingData } = await supabase
        .from('followers')
        .select(`
          following:users!following_id(*)
        `)
        .eq('follower_id', user.id);

      setUserPosts(postsData || []);
      setFollowers(followersData?.map(f => f.follower) || []);
      setFollowing(followingData?.map(f => f.following) || []);
    } catch (error) {
      console.error('Fetch user data error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const fileData = e.target.result;
      const isVideo = file.type.startsWith('video');
      
      if (type === 'avatar') {
        setEditData({
          ...editData,
          avatar: fileData,
          avatarType: isVideo ? 'video' : 'image'
        });
      } else if (type === 'banner') {
        setEditData({
          ...editData,
          banner: fileData,
          bannerType: isVideo ? 'video' : 'image'
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!isLoading) {
      setIsLoading(true);
      try {
        const { error } = await supabase
          .from('users')
          .update({
            full_name: editData.fullName,
            bio: editData.bio,
            city: editData.city,
            avatar: editData.avatar,
            avatar_type: editData.avatarType,
            banner: editData.banner,
            banner_type: editData.bannerType
          })
          .eq('id', user.id);
        
        if (error) throw error;
        
        onUpdateUser({
          ...user,
          fullName: editData.fullName,
          bio: editData.bio,
          city: editData.city,
          avatar: editData.avatar,
          avatarType: editData.avatarType,
          banner: editData.banner,
          bannerType: editData.bannerType
        });
        
        setIsEditing(false);
        alert('Профиль обновлен!');
      } catch (error) {
        console.error('Update profile error:', error);
        alert('Ошибка обновления профиля');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderBanner = () => {
    if (editData.bannerType === 'video') {
      return (
        <video 
          src={editData.banner} 
          className="profile-banner-media"
          muted 
          autoPlay 
          loop 
        />
      );
    } else if (editData.banner) {
      return (
        <img 
          src={editData.banner} 
          alt="Banner" 
          className="profile-banner-media"
        />
      );
    } else {
      return (
        <div className="profile-banner-placeholder">
          <CameraIcon size={32} />
          <span>Добавить баннер</span>
        </div>
      );
    }
  };

  const renderAvatar = () => {
    if (editData.avatarType === 'video') {
      return (
        <video 
          src={editData.avatar} 
          className="profile-avatar-media"
          muted 
          autoPlay 
          loop 
        />
      );
    } else {
      return (
        <img 
          src={editData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
          alt={user.username}
          className="profile-avatar-media"
        />
      );
    }
  };

  return (
    <div className="profile-overlay">
      <div className="profile-header">
        <button className="back-button" onClick={onClose}>
          <ArrowLeftIcon size={20} />
        </button>
        <h2>Профиль</h2>
        <button 
          className="edit-profile-header-btn"
          onClick={() => setIsEditing(!isEditing)}
          disabled={isLoading}
        >
          {isEditing ? 'Отменить' : 'Редактировать'}
        </button>
      </div>

      <div className="profile-banner-container">
        <div className="profile-banner">
          {renderBanner()}
          {isEditing && (
            <label className="edit-banner-btn">
              <input 
                type="file" 
                accept="image/*,video/*"
                onChange={(e) => handleFileUpload(e.target.files[0], 'banner')}
                disabled={isLoading}
              />
              <CameraIcon size={20} />
            </label>
          )}
        </div>
      </div>

      <div className="profile-info">
        <div className="profile-avatar-section">
          <div className="profile-avatar-container">
            {renderAvatar()}
            {isEditing && (
              <label className="edit-avatar-btn">
                <input 
                  type="file" 
                  accept="image/*,video/*"
                  onChange={(e) => handleFileUpload(e.target.files[0], 'avatar')}
                  disabled={isLoading}
                />
                <CameraIcon size={16} />
              </label>
            )}
          </div>
        </div>

        <div className="profile-details">
          {isEditing ? (
            <div className="edit-profile-form">
              <input
                type="text"
                value={editData.fullName}
                onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                placeholder="Полное имя"
                className="edit-input"
                disabled={isLoading}
              />
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData({...editData, bio: e.target.value})}
                placeholder="О себе"
                className="edit-input"
                rows="3"
                disabled={isLoading}
              />
              <input
                type="text"
                value={editData.city}
                onChange={(e) => setEditData({...editData, city: e.target.value})}
                placeholder="Город"
                className="edit-input"
                disabled={isLoading}
              />
              <button 
                onClick={handleSave}
                className="save-profile-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          ) : (
            <>
              <h1 className="profile-name">{editData.fullName || user.username}</h1>
              <p className="profile-username">@{user.username}</p>
              {editData.bio && <p className="profile-bio">{editData.bio}</p>}
              {editData.city && (
                <p className="profile-location">
                  <GlobeIcon size={16} /> {editData.city}
                </p>
              )}
            </>
          )}

          <div className="profile-stats">
            <div className="stat">
              <strong>{userPosts.length}</strong>
              <span>постов</span>
            </div>
            <div className="stat">
              <strong>{followers.length}</strong>
              <span>подписчиков</span>
            </div>
            <div className="stat">
              <strong>{following.length}</strong>
              <span>подписок</span>
            </div>
          </div>

          <div className="profile-tabs">
            <button 
              className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              Посты
            </button>
            <button 
              className={`profile-tab ${activeTab === 'followers' ? 'active' : ''}`}
              onClick={() => setActiveTab('followers')}
            >
              Подписчики
            </button>
            <button 
              className={`profile-tab ${activeTab === 'following' ? 'active' : ''}`}
              onClick={() => setActiveTab('following')}
            >
              Подписки
            </button>
          </div>
        </div>
      </div>

      <div className="profile-content">
        {activeTab === 'posts' && (
          <div className="profile-posts-grid">
            {userPosts.length > 0 ? (
              userPosts.map(post => (
                <div key={post.id} className="profile-post-item">
                  {post.image ? (
                    <img src={post.image} alt="Post" />
                  ) : (
                    <div className="text-post-preview">
                      <FileTextIcon size={24} />
                      <p>{post.content.substring(0, 50)}...</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-posts">
                <p>Пока нет постов</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'followers' && (
          <div className="followers-list">
            {followers.length > 0 ? (
              followers.map(follower => (
                <div key={follower.id} className="follower-item">
                  <img 
                    src={follower.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${follower.username}`} 
                    alt={follower.username}
                    className="follower-avatar"
                  />
                  <div className="follower-info">
                    <h4>{follower.full_name || follower.username}</h4>
                    <p>@{follower.username}</p>
                  </div>
                  <button className="follow-btn">
                    Отписаться
                  </button>
                </div>
              ))
            ) : (
              <div className="no-followers">
                <p>Пока нет подписчиков</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'following' && (
          <div className="following-list">
            {following.length > 0 ? (
              following.map(followingUser => (
                <div key={followingUser.id} className="following-item">
                  <img 
                    src={followingUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${followingUser.username}`} 
                    alt={followingUser.username}
                    className="following-avatar"
                  />
                  <div className="following-info">
                    <h4>{followingUser.full_name || followingUser.username}</h4>
                    <p>@{followingUser.username}</p>
                  </div>
                  <button className="unfollow-btn">
                    Отписаться
                  </button>
                </div>
              ))
            ) : (
              <div className="no-following">
                <p>Вы ни на кого не подписаны</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Компонент создания поста
const CreatePostModal = ({ user, onClose, onCreatePost }) => {
  const [postData, setPostData] = useState({
    content: '',
    media: null,
    mediaType: null,
    mediaUrl: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef(null);

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setPostData({
        ...postData,
        media: file,
        mediaType: file.type.startsWith('video') ? 'video' : 
                  file.type.startsWith('audio') ? 'audio' : 'image',
        mediaUrl: e.target.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postData.content.trim() && !postData.media) return;

    setIsLoading(true);
    try {
      const postToCreate = {
        user_id: user.id,
        content: postData.content,
        image: postData.mediaType === 'image' ? postData.mediaUrl : null,
        video: postData.mediaType === 'video' ? postData.mediaUrl : null,
        audio: postData.mediaType === 'audio' ? postData.mediaUrl : null
      };

      const { data, error } = await supabase
        .from('posts')
        .insert([postToCreate])
        .select()
        .single();

      if (error) throw error;

      onCreatePost(data);
      onClose();
      
      // Сброс формы
      setPostData({
        content: '',
        media: null,
        mediaType: null,
        mediaUrl: ''
      });
      setIsExpanded(false);
    } catch (error) {
      console.error('Create post error:', error);
      alert('Ошибка при создании поста');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextareaFocus = () => {
    setIsExpanded(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
    }, 0);
  };

  const handleTextareaInput = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  return (
    <div className="create-post-modal-overlay">
      <div className={`create-post-modal ${isExpanded ? 'expanded' : ''}`}>
        <div className="create-post-modal-header">
          <h3>Создать пост</h3>
          <button 
            className="close-modal-btn"
            onClick={onClose}
            disabled={isLoading}
          >
            <CloseIcon size={24} />
          </button>
        </div>

        <div className="create-post-modal-content">
          <div className="create-post-user">
            <img 
              src={user.avatar} 
              alt={user.username}
              className="create-post-avatar"
            />
            <div>
              <h4>{user.fullName}</h4>
              <p>@{user.username}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="create-post-form">
            <textarea
              ref={textareaRef}
              placeholder="Что у вас нового?"
              value={postData.content}
              onChange={(e) => setPostData({...postData, content: e.target.value})}
              onFocus={handleTextareaFocus}
              onInput={handleTextareaInput}
              className="create-post-textarea"
              rows={isExpanded ? 6 : 3}
              disabled={isLoading}
              autoFocus
            />

            {postData.mediaUrl && (
              <div className="media-preview">
                {postData.mediaType === 'video' && (
                  <video 
                    src={postData.mediaUrl} 
                    controls 
                    className="media-preview-item"
                  />
                )}
                {postData.mediaType === 'audio' && (
                  <audio 
                    src={postData.mediaUrl} 
                    controls 
                    className="media-preview-item"
                  />
                )}
                {postData.mediaType === 'image' && (
                  <img 
                    src={postData.mediaUrl} 
                    alt="Preview" 
                    className="media-preview-item"
                  />
                )}
                <button 
                  type="button"
                  onClick={() => setPostData({...postData, media: null, mediaType: null, mediaUrl: ''})}
                  className="remove-media-btn"
                  disabled={isLoading}
                >
                  <CloseIcon size={16} />
                </button>
              </div>
            )}

            <div className="create-post-actions">
              <div className="media-buttons">
                <label className="media-btn">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleMediaUpload}
                    disabled={isLoading}
                  />
                  <ImageIcon size={20} />
                  <span>Фото</span>
                </label>
                <label className="media-btn">
                  <input 
                    type="file" 
                    accept="video/*"
                    onChange={handleMediaUpload}
                    disabled={isLoading}
                  />
                  <VideoIcon size={20} />
                  <span>Видео</span>
                </label>
                <label className="media-btn">
                  <input 
                    type="file" 
                    accept="audio/*"
                    onChange={handleMediaUpload}
                    disabled={isLoading}
                  />
                  <MusicIcon size={20} />
                  <span>Музыка</span>
                </label>
                <button type="button" className="media-btn" disabled={isLoading}>
                  <FileTextIcon size={20} />
                  <span>Текст</span>
                </button>
              </div>

              <button 
                type="submit" 
                className="create-post-submit"
                disabled={isLoading || (!postData.content.trim() && !postData.media)}
              >
                {isLoading ? 'Публикация...' : 'Опубликовать'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Компонент поста
const Post = ({ post, currentUser, onLike, onComment, onEdit, onDelete }) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef(null);

  const isLiked = post.likes?.some(like => like.user_id === currentUser.id);
  const canEdit = post.user_id === currentUser.id;

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (commentText.trim() && !isLoading) {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('comments')
          .insert([
            {
              post_id: post.id,
              user_id: currentUser.id,
              username: currentUser.username,
              avatar: currentUser.avatar,
              content: commentText
            }
          ])
          .select()
          .single();
        
        if (error) throw error;
        
        const newComment = {
          id: data.id,
          user: {
            username: currentUser.username,
            avatar: currentUser.avatar,
            avatarType: currentUser.avatarType
          },
          text: commentText,
          timestamp: new Date(data.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
        };
        
        onComment(post.id, newComment);
        setCommentText('');
      } catch (error) {
        console.error('Error adding comment:', error);
        alert('Ошибка при добавлении комментария');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleLike = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (isLiked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', currentUser.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert([
            {
              post_id: post.id,
              user_id: currentUser.id
            }
          ]);
        
        if (error) throw error;
      }
      
      onLike(post.id);
    } catch (error) {
      console.error('Error liking post:', error);
      alert('Ошибка при лайке');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (editContent.trim() && editContent !== post.content && !isLoading) {
      setIsLoading(true);
      try {
        const { error } = await supabase
          .from('posts')
          .update({ 
            content: editContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', post.id);
        
        if (error) throw error;
        
        onEdit(post.id, editContent);
        setIsEditing(false);
      } catch (error) {
        console.error('Error editing post:', error);
        alert('Ошибка при редактировании поста');
      } finally {
        setIsLoading(false);
      }
    }
    setShowMoreMenu(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Удалить этот пост?')) {
      setIsLoading(true);
      try {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', post.id);
        
        if (error) throw error;
        
        onDelete(post.id);
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Ошибка при удалении поста');
      } finally {
        setIsLoading(false);
      }
    }
    setShowMoreMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isEditing) {
    return (
      <div className="post">
        <div className="post-header">
          <img src={post.user?.avatar} alt={post.user?.username} className="post-avatar" />
          <div className="post-user-info">
            <span className="post-username">{post.user?.username}</span>
            <span className="post-time">Редактирование</span>
          </div>
        </div>
        
        <div style={{ padding: '16px' }}>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="edit-post-textarea"
            placeholder="Что у вас нового?"
            disabled={isLoading}
            rows="4"
          />
          
          <div className="edit-post-buttons">
            <button 
              onClick={handleEdit}
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button 
              onClick={() => {
                setIsEditing(false);
                setEditContent(post.content);
              }}
              className="btn-secondary"
              disabled={isLoading}
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="post">
      <div className="post-header">
        <img src={post.user?.avatar} alt={post.user?.username} className="post-avatar" />
        <div className="post-user-info">
          <span className="post-username">{post.user?.username}</span>
          <span className="post-time">
            {post.timestamp} 
            {post.edited && <span className="edited-badge">(ред.)</span>}
          </span>
        </div>
        <div className="post-more-container" ref={menuRef}>
          <button 
            className="post-more-btn" 
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            disabled={isLoading}
          >
            <MoreIcon size={20} />
          </button>
          
          {showMoreMenu && (
            <div className="more-menu">
              {canEdit && (
                <button 
                  onClick={() => {
                    setIsEditing(true);
                    setShowMoreMenu(false);
                  }}
                  className="more-menu-item"
                  disabled={isLoading}
                >
                  <EditIcon size={16} /> Редактировать
                </button>
              )}
              <button 
                onClick={handleDelete}
                className="more-menu-item delete"
                disabled={isLoading}
              >
                <CloseIcon size={16} /> Удалить
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="post-content">
        <p style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
        
        {post.image && <img src={post.image} alt="Post" className="post-media" />}
        {post.video && (
          <video src={post.video} controls className="post-media">
            Ваш браузер не поддерживает видео.
          </video>
        )}
        {post.audio && (
          <audio src={post.audio} controls className="post-audio">
            Ваш браузер не поддерживает аудио.
          </audio>
        )}
      </div>

      <div className="post-stats">
        <span>{post.likes?.length || 0} <HeartIcon size={14} /></span>
        <span>{post.comments?.length || 0} <CommentIcon size={14} /></span>
        <span>{post.shares || 0} <ShareIcon size={14} /></span>
      </div>

      <div className="post-actions">
        <button 
          className={`action-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={isLoading}
        >
          <LikeIcon size={20} filled={isLiked} />
          <span>{isLoading ? '...' : 'Нравится'}</span>
        </button>
        <button 
          className="action-btn" 
          onClick={() => setShowComments(!showComments)}
          disabled={isLoading}
        >
          <CommentIcon size={20} />
          <span>Комментировать</span>
        </button>
        <button className="action-btn" disabled={isLoading}>
          <ShareIcon size={20} />
          <span>Поделиться</span>
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <div className="comments-list">
            {post.comments?.map(comment => (
              <div key={comment.id} className="comment">
                <img src={comment.user?.avatar} alt={comment.user?.username} className="comment-avatar" />
                <div className="comment-content">
                  <span className="comment-username">{comment.user?.username}</span>
                  <p className="comment-text">{comment.text}</p>
                  <span className="comment-time">{comment.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddComment} className="comment-form">
            <input
              type="text"
              placeholder="Напишите комментарий..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="comment-input"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="comment-submit"
              disabled={isLoading || !commentText.trim()}
            >
              {isLoading ? '...' : 'Отправить'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// Главный компонент социальной сети
const SocialNetwork = ({ user, onLogout }) => {
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userData, setUserData] = useState(user);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    fetchPosts();
    applyTheme();
    
    const interval = setInterval(() => {
      setIsOnline(Math.random() > 0.3);
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setUserData(prev => ({ ...prev, isOnline }));
  }, [isOnline]);

  const applyTheme = useCallback(() => {
  document.documentElement.setAttribute('data-theme', userData.theme || 'light');
}, [userData.theme]);

useEffect(() => {
  applyTheme();
}, [applyTheme]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          user:users(id, username, avatar, avatar_type, full_name),
          comments:comments(*),
          likes:post_likes(*)
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (postsError) throw postsError;
      
      const formattedPosts = postsData.map(post => ({
        id: post.id,
        user_id: post.user_id,
        user: {
          id: post.user?.id || post.user_id,
          username: post.user?.username || 'Неизвестный',
          avatar: post.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`,
          avatarType: post.user?.avatar_type || 'image',
          fullName: post.user?.full_name
        },
        content: post.content,
        image: post.image,
        video: post.video,
        audio: post.audio,
        likes: post.likes || [],
        comments: post.comments?.map(comment => ({
          id: comment.id,
          user: {
            username: comment.username,
            avatar: comment.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_id}`,
            avatarType: 'image'
          },
          text: comment.content,
          timestamp: new Date(comment.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
        })) || [],
        timestamp: new Date(post.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        edited: post.updated_at && post.updated_at !== post.created_at
      }));
      
      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = (newPost) => {
    const postObj = {
      id: newPost.id,
      user_id: newPost.user_id,
      user: {
        id: userData.id,
        username: userData.username,
        avatar: userData.avatar,
        avatarType: userData.avatarType,
        fullName: userData.fullName
      },
      content: newPost.content,
      image: newPost.image,
      video: newPost.video,
      audio: newPost.audio,
      likes: [],
      comments: [],
      timestamp: new Date(newPost.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };
    
    setPosts([postObj, ...posts]);
  };

  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const likes = post.likes.some(like => like.user_id === userData.id) 
          ? post.likes.filter(like => like.user_id !== userData.id)
          : [...post.likes, { user_id: userData.id }];
        return { ...post, likes };
      }
      return post;
    }));
  };

  const handleComment = (postId, comment) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, comments: [...post.comments, comment] };
      }
      return post;
    }));
  };

  const handleEditPost = (postId, newContent) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            content: newContent, 
            edited: true,
            timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) + ' (ред.)'
          } 
        : post
    ));
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  const handleUpdateUser = (updatedUser) => {
    setUserData(updatedUser);
    applyTheme();
  };

  const MobileNav = () => (
    <nav className="mobile-nav mobile-only">
      <div className="nav-items-container">
        <button 
          className={`nav-item-mobile ${activeTab === 'home' ? 'active' : ''}`} 
          onClick={() => setActiveTab('home')}
        >
          <HomeIcon size={24} />
        </button>
        <button 
          className={`nav-item-mobile ${activeTab === 'friends' ? 'active' : ''}`} 
          onClick={() => setActiveTab('friends')}
        >
          <FriendsIcon size={24} />
        </button>
        <button 
          className="nav-item-mobile create-post-btn-mobile"
          onClick={() => setShowCreatePost(true)}
        >
          <PlusIcon size={24} />
        </button>
        <button 
          className={`nav-item-mobile ${activeTab === 'search' ? 'active' : ''}`} 
          onClick={() => setShowSearch(true)}
        >
          <SearchIcon size={24} />
        </button>
        <button 
          className={`nav-item-mobile ${activeTab === 'profile' ? 'active' : ''}`} 
          onClick={() => setShowProfile(true)}
        >
          <UserIcon size={24} />
        </button>
      </div>
    </nav>
  );

  const MobileHeader = () => (
    <header className="mobile-header mobile-only">
      <div className="mobile-header-content">
        <h1>Sphere</h1>
        <div className="mobile-header-actions">
          <button className="mobile-header-btn" onClick={() => setShowSearch(true)}>
            <SearchIcon size={20} />
          </button>
          <button className="mobile-header-btn" onClick={() => setShowSettings(true)}>
            <SettingsIcon size={20} />
          </button>
        </div>
      </div>
    </header>
  );

  const renderContent = () => {
    if (showSearch) {
      return <SearchComponent onClose={() => setShowSearch(false)} user={userData} />;
    }

    if (showSettings) {
      return <SettingsComponent user={userData} onClose={() => setShowSettings(false)} onUpdateUser={handleUpdateUser} />;
    }

    if (showProfile) {
      return <ProfileComponent user={userData} onClose={() => setShowProfile(false)} onUpdateUser={handleUpdateUser} />;
    }

    return (
      <>
        {/* Заголовок ленты */}
        <div className="feed-header">
          <h2>Лента</h2>
          <button className="refresh-btn" onClick={fetchPosts} disabled={isLoading}>
            {isLoading ? 'Обновление...' : 'Обновить'}
          </button>
        </div>

        {/* Создание поста (в ленте) */}
        <div className="create-post-inline" onClick={() => setShowCreatePost(true)}>
          <img src={userData.avatar} alt={userData.username} className="create-post-avatar-inline" />
          <div className="create-post-input-container">
            <input
              type="text"
              placeholder="Что у вас нового?"
              className="create-post-input-inline"
              readOnly
            />
          </div>
        </div>

        {/* Лента постов */}
        <div className="feed">
          {isLoading && posts.length === 0 ? (
            <div className="loading-posts">
              <p>Загрузка постов...</p>
            </div>
          ) : posts.length > 0 ? (
            posts.map(post => (
              <Post
                key={post.id}
                post={post}
                currentUser={userData}
                onLike={handleLike}
                onComment={handleComment}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
              />
            ))
          ) : (
            <div className="empty-feed">
              <p>Лента пуста</p>
              <p>Создайте первый пост!</p>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="social-network">
      {/* Боковое меню для ПК */}
      <Sidebar 
        user={userData}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreatePost={() => setShowCreatePost(true)}
        onShowProfile={() => setShowProfile(true)}
        onLogout={onLogout}
      />

      {/* Мобильный хедер */}
      <MobileHeader />

      {/* Основной контент */}
      <main className="main-content">
        {renderContent()}
      </main>

      {/* Мобильная навигация */}
      <MobileNav />

      {/* Модальное окно создания поста */}
      {showCreatePost && (
        <CreatePostModal 
          user={userData}
          onClose={() => setShowCreatePost(false)}
          onCreatePost={handleCreatePost}
        />
      )}
    </div>
  );
};

// Главный App компонент
function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="App">
      <AuthComponent onLogin={handleLogin} user={user} />
      {user && <SocialNetwork user={user} onLogout={handleLogout} />}
    </div>
  );
}

export default App;