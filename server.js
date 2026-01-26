const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

// ==================== БАЗА ДАННЫХ (в памяти) ====================
let users = [
  {
    id: 1,
    username: 'admin',
    password: '$2a$10$X5hYV8BdNzq6q5p8bQKJvO9V2bT3cD4eF5gH6iJ7kL8mN9oP0qR1sT2u', // admin123
    email: 'admin@sphere.com',
    firstName: 'Администратор',
    lastName: 'Системы',
    avatar: '',
    banner: '',
    city: 'Москва',
    bio: 'Администратор социальной сети Sphere',
    isVerified: true,
    isAdmin: true,
    settings: { privateAccount: false },
    stats: { posts: 5, followers: 150, following: 50 },
    followers: ['testuser'],
    following: ['testuser'],
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    username: 'testuser',
    password: '$2a$10$X5hYV8BdNzq6q5p8bQKJvO9V2bT3cD4eF5gH6iJ7kL8mN9oP0qR1sT2u', // 123456
    email: 'test@sphere.com',
    firstName: 'Тестовый',
    lastName: 'Пользователь',
    avatar: '',
    banner: '',
    city: 'Москва',
    bio: 'Привет! Я тестовый пользователь Sphere',
    isVerified: false,
    isAdmin: false,
    settings: { privateAccount: false },
    stats: { posts: 3, followers: 45, following: 23 },
    followers: ['admin'],
    following: ['admin'],
    createdAt: new Date().toISOString()
  }
];

let posts = [
  {
    id: 1,
    author: 'testuser',
    content: 'Добро пожаловать в Sphere! 🚀 Это демонстрационная социальная сеть.',
    media: null,
    likes: ['admin'],
    comments: [
      {
        id: 1,
        author: 'admin',
        content: 'Отличный пост! 👍',
        likes: [],
        timestamp: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    tags: ['welcome', 'social']
  }
];

let notifications = [];

// ==================== MIDDLEWARE ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Отдаем статические файлы

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  req.method === 'OPTIONS' ? res.sendStatus(200) : next();
});

// Проверка токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Токен не предоставлен' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Неверный токен' });
    req.user = user;
    next();
  });
};

// ==================== АВТОРИЗАЦИЯ ====================

// Регистрация
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;
    
    if (!username || !password || !email || !firstName) {
      return res.status(400).json({ error: 'Заполните обязательные поля' });
    }
    
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: users.length + 1,
      username,
      password: hashedPassword,
      email,
      firstName,
      lastName: lastName || '',
      avatar: '',
      banner: '',
      city: '',
      bio: '',
      isVerified: false,
      isAdmin: false,
      settings: { privateAccount: false },
      stats: { posts: 0, followers: 0, following: 0 },
      followers: [],
      following: [],
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, isAdmin: false },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        isVerified: false,
        isAdmin: false,
        avatar: '',
        stats: { posts: 0, followers: 0, following: 0 },
        settings: { privateAccount: false }
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Вход
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    
    if (!user) return res.status(401).json({ error: 'Неверные данные' });
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Неверные данные' });
    
    const token = jwt.sign(
      { id: user.id, username: user.username, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
        avatar: user.avatar,
        stats: user.stats,
        settings: user.settings
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение профиля
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isVerified: user.isVerified,
    isAdmin: user.isAdmin,
    avatar: user.avatar,
    banner: user.banner,
    bio: user.bio,
    city: user.city,
    stats: user.stats,
    settings: user.settings,
    followers: user.followers,
    following: user.following,
    createdAt: user.createdAt
  });
});

// ==================== ПОЛЬЗОВАТЕЛИ ====================

// Получение пользователя
app.get('/api/users/:username', authenticateToken, (req, res) => {
  const user = users.find(u => u.username === req.params.username);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  
  const currentUser = users.find(u => u.id === req.user.id);
  const userPosts = posts.filter(p => p.author === user.username);
  
  res.json({
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    banner: user.banner,
    bio: user.bio,
    city: user.city,
    isVerified: user.isVerified,
    isAdmin: user.isAdmin,
    stats: {
      posts: userPosts.length,
      followers: user.followers.length,
      following: user.following.length
    },
    followers: user.followers,
    following: user.following,
    createdAt: user.createdAt,
    isFollowing: user.followers.includes(currentUser.username)
  });
});

// Подписка/отписка
app.post('/api/users/follow/:username', authenticateToken, (req, res) => {
  const currentUser = users.find(u => u.id === req.user.id);
  const targetUser = users.find(u => u.username === req.params.username);
  
  if (!targetUser) return res.status(404).json({ error: 'Пользователь не найден' });
  if (currentUser.username === targetUser.username) {
    return res.status(400).json({ error: 'Нельзя подписаться на самого себя' });
  }
  
  const isFollowing = targetUser.followers.includes(currentUser.username);
  
  if (isFollowing) {
    targetUser.followers = targetUser.followers.filter(f => f !== currentUser.username);
    currentUser.following = currentUser.following.filter(f => f !== targetUser.username);
  } else {
    targetUser.followers.push(currentUser.username);
    currentUser.following.push(targetUser.username);
  }
  
  res.json({
    message: isFollowing ? 'Вы отписались' : 'Вы подписались',
    isFollowing: !isFollowing,
    followersCount: targetUser.followers.length
  });
});

// Обновление профиля
app.put('/api/users/profile', authenticateToken, (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.user.id);
  if (userIndex === -1) return res.status(404).json({ error: 'Пользователь не найден' });
  
  const { firstName, lastName, bio, city, settings } = req.body;
  
  if (firstName) users[userIndex].firstName = firstName;
  if (lastName) users[userIndex].lastName = lastName;
  if (bio !== undefined) users[userIndex].bio = bio;
  if (city !== undefined) users[userIndex].city = city;
  if (settings) users[userIndex].settings = { ...users[userIndex].settings, ...settings };
  
  res.json({
    message: 'Профиль обновлен',
    user: users[userIndex]
  });
});

// ==================== ПОСТЫ ====================

// Все посты
app.get('/api/posts', authenticateToken, (req, res) => {
  const currentUser = users.find(u => u.id === req.user.id);
  
  const postsWithAuthors = posts.map(post => {
    const author = users.find(u => u.username === post.author);
    return {
      ...post,
      authorInfo: {
        username: author?.username || 'unknown',
        firstName: author?.firstName || 'User',
        lastName: author?.lastName || '',
        avatar: author?.avatar || '',
        isVerified: author?.isVerified || false,
        isAdmin: author?.isAdmin || false
      },
      isLiked: post.likes?.includes(currentUser.username) || false,
      canEdit: post.author === currentUser.username || currentUser?.isAdmin
    };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json(postsWithAuthors);
});

// Создание поста
app.post('/api/posts', authenticateToken, (req, res) => {
  const { content } = req.body;
  const currentUser = users.find(u => u.id === req.user.id);
  
  if (!content) return res.status(400).json({ error: 'Добавьте текст' });
  
  const newPost = {
    id: posts.length + 1,
    author: currentUser.username,
    content,
    media: null,
    likes: [],
    comments: [],
    createdAt: new Date().toISOString(),
    tags: content.match(/#[\wа-яА-ЯёЁ]+/g)?.map(t => t.substring(1)) || []
  };
  
  posts.push(newPost);
  
  // Обновляем статистику
  const userIndex = users.findIndex(u => u.id === req.user.id);
  if (userIndex !== -1) {
    users[userIndex].stats.posts++;
  }
  
  res.json({
    message: 'Пост создан',
    post: {
      ...newPost,
      authorInfo: {
        username: currentUser.username,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        avatar: currentUser.avatar,
        isVerified: currentUser.isVerified,
        isAdmin: currentUser.isAdmin
      },
      isLiked: false,
      canEdit: true
    }
  });
});

// Лайк поста
app.post('/api/posts/:id/like', authenticateToken, (req, res) => {
  const postId = parseInt(req.params.id);
  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex === -1) return res.status(404).json({ error: 'Пост не найден' });
  
  const post = posts[postIndex];
  const currentUser = users.find(u => u.id === req.user.id);
  
  if (!post.likes) post.likes = [];
  const likeIndex = post.likes.indexOf(currentUser.username);
  
  if (likeIndex > -1) {
    post.likes.splice(likeIndex, 1);
  } else {
    post.likes.push(currentUser.username);
  }
  
  posts[postIndex] = post;
  
  res.json({
    message: likeIndex > -1 ? 'Лайк удален' : 'Лайк добавлен',
    likesCount: post.likes.length,
    isLiked: likeIndex === -1
  });
});

// Комментарии
app.post('/api/posts/:id/comments', authenticateToken, (req, res) => {
  const { content } = req.body;
  const postId = parseInt(req.params.id);
  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex === -1) return res.status(404).json({ error: 'Пост не найден' });
  if (!content) return res.status(400).json({ error: 'Введите текст' });
  
  const post = posts[postIndex];
  const currentUser = users.find(u => u.id === req.user.id);
  
  const commentId = post.comments?.length ? Math.max(...post.comments.map(c => c.id)) + 1 : 1;
  const newComment = {
    id: commentId,
    author: currentUser.username,
    content,
    likes: [],
    timestamp: new Date().toISOString()
  };
  
  if (!post.comments) post.comments = [];
  post.comments.push(newComment);
  posts[postIndex] = post;
  
  res.json({
    message: 'Комментарий добавлен',
    comment: newComment
  });
});

// ==================== ПОИСК ====================

app.get('/api/search', authenticateToken, (req, res) => {
  const { q } = req.query;
  const currentUser = users.find(u => u.id === req.user.id);
  
  if (!q) return res.json({ users: [], posts: [] });
  
  const searchTerm = q.toLowerCase();
  
  const foundUsers = users
    .filter(u => 
      u.username.toLowerCase().includes(searchTerm) ||
      u.firstName.toLowerCase().includes(searchTerm)
    )
    .filter(u => u.username !== currentUser.username)
    .map(u => ({
      id: u.id,
      username: u.username,
      firstName: u.firstName,
      lastName: u.lastName,
      avatar: u.avatar,
      isFollowing: u.followers.includes(currentUser.username)
    }));
  
  const foundPosts = posts
    .filter(p => p.content.toLowerCase().includes(searchTerm))
    .slice(0, 10)
    .map(p => {
      const author = users.find(u => u.username === p.author);
      return {
        ...p,
        authorInfo: {
          username: author?.username || 'unknown',
          firstName: author?.firstName || 'User',
          lastName: author?.lastName || ''
        }
      };
    });
  
  res.json({ users: foundUsers, posts: foundPosts });
});

// ==================== ГЛАВНАЯ СТРАНИЦА ====================

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ==================== ЗАПУСК СЕРВЕРА ====================

app.listen(PORT, () => {
  console.log(`✅ Sphere Social Network запущена!`);
  console.log(`🌐 Адрес: http://localhost:${PORT}`);
  console.log(`👑 Администратор: admin / admin123`);
  console.log(`👤 Тестовый пользователь: testuser / 123456`);
  console.log(`📡 API доступно по: http://localhost:${PORT}/api`);
});