import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';


const AuthPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLogin = async () => {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('username', formData.username);
      params.append('password', formData.password);

      const response = await api.post('/api/user/token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log('Успешная авторизация:', response.data);

      // Сохранение токена в куках
      Cookies.set('accessToken', response.data.access_token, { expires: 7 }); // Устанавливаем срок действия токена

      setError(null);

      // Перенаправление на главную страницу
      navigate('/');
    } catch (error) {
      console.error('Ошибка при авторизации:', error);
      setError('Ошибка при авторизации. Проверьте введенные данные.');
    }
  };

  return (
    <div>
      <div className="col-md-2 col-xl-6 text-center mx-auto bg-primary">
        <h2>Добро пожаловать!</h2>
      </div>
      <div className="col-md-8 col-xl-6 text-center mx-auto">
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className='md-3'>
            <input className='form-control'
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder='Имя пользователя'
            required
            />
        </div>
        <br />
        <div className='md-3'>
            <input className='form-control'
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder='Пароль'
            required
            />
        </div>
        <br />
        <div className='mb-3 text-center'>
            <button className='btn btn-primary w-100' onClick={handleLogin} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} tabIndex={0}>Войти</button>
        </div>
        <div>
            <p className='text-muted'>
            <Link to="/registration">Регистрация</Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
