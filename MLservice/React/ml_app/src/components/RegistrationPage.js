import React, { useState } from 'react';
import api from '../api'; // Импортируйте ваш модуль API
import { useNavigate } from 'react-router-dom';  // Обновлен импорт


const RegistrationPage = () => {
    const navigate = useNavigate();  // Используем useNavigate вместо useHistory
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
  
    try {
      // Отправляем запрос на создание пользователя
      const response = await api.post('/api/user/', {
        username: formData.username,
        password: formData.password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      // Обработка успешного создания пользователя
      console.log('Пользователь успешно зарегистрирован:', response.data);
      navigate('/auth');
  
      // Сбросить состояние формы после успешной регистрации
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
      });
  
      setError(null); // Сбросить ошибку, если она была предыдущей
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      setError('Ошибка при регистрации. Попробуйте еще раз.');
    }
  };
  

  return (
    <div>
      <nav className='navbar navbar-dark bg-primary'>
        <div className='container-fluid'>
            <a className='navbar-brand' href='#'>Регистрация</a>
        </div>
      </nav>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
        <label className='mb-3 mt-3'>
          Имя пользователя:
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </label>
        </div>
        <br />
        <label>
          Пароль:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Подтвердите пароль:
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <button type="submit">Зарегистрироваться</button>
      </form>
    </div>
  );
};

export default RegistrationPage;
