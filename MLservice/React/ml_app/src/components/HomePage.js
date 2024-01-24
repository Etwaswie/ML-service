import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Cookies from 'js-cookie';

const HomePage = () => {
  const [userData, setUserData] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState([]);

  const handleLogout = () => {
    // Отзыв авторизации (удаление токена)
    Cookies.remove('accessToken');

    // Перезагрузка страницы
    window.location.reload();
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const accessToken = Cookies.get('accessToken');

        if (!accessToken) {
          setLoading(false);
          return;
        }

        const response = await api.get('/api/user/', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setUserData(response.data.User);
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        setLoading(false);
      }
    };

    const handleLogout = () => {
        // Отзыв авторизации (удаление токена)
        Cookies.remove('accessToken');
    
        // Перезагрузка страницы
        window.location.reload();
      };

    const fetchUserBalance = async () => {
      try {
        const accessToken = Cookies.get('accessToken');

        if (!accessToken) {
          return;
        }

        const response = await api.get('/api/user/balance', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setUserBalance(response.data.balance);
      } catch (error) {
        console.error('Ошибка при получении баланса пользователя:', error);
      }
    };

    fetchUserData();
    fetchUserBalance();

    const fetchModels = async () => {
      try {
        const response = await api.get('/api/models');
        setModels(response.data);
      } catch (error) {
        console.error('Ошибка при получении списка моделей:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();

    
  }, []);

  return (
    <div>
      <div>
        <nav className='navbar navbar-expand-lg fixed-top clean-navbar navbar-dark bg-primary'>
          <div className='container-fluid'>
              <a className='navbar-brand brand' href='#'>MLservice</a>
          </div>
          <div id='navcol-1' className='collapse navbar-collapse'>
                  {userData ? (
                      <ul className='navbar-nav ms-auto'>
                          <li className='nav-item'>
                              <a className="nav-link-active text-white col px-md-2" href="/">Home</a>
                          </li>
                          <li className='nav-item'>
                              <p className='text-white text-nowrap col px-md-2'>Привет, {userData.name}!</p>
                          </li>
                          <li className='nav-item'>
                              <p className='text-white text-nowrap col px-md-2'>Баланс: {userBalance === null ? 'Нет данных' : userBalance}</p>
                          </li>
                          <li className='nav-item'>
                              <a className="nav-link-active text-white text-nowrap col px-md-2" href="/user-dashboard">Личный кабинет</a>
                          </li>
                          <li className='nav-item'>
                              <a className="nav-link-active text-white col px-md-2" onClick={handleLogout}>Выход</a>
                          </li>
                      </ul>
                  ) : (
                      <ul className='navbar-nav ms-auto'>
                          <li className='nav-item col px-md-5'>
                              <a className="nav-link-active text-white" href="/auth">Авторизация</a>
                          </li>
                          <li className='nav-item col px-md-5'>
                              <a className="nav-link-active text-white" href="/registration">Регистрация</a>
                          </li>
                      </ul>
                  )}
          </div>
        </nav>
        <div class='addMargin'>
            <h2>Доступные модели</h2>
            <ul>
              {models.map((model) => (
                <li key={model.model_id}>
                  <p>Название: <Link to={`/models/${model.model_id}`}>{model.model_name}</Link></p>
                  <p>Описание: {model.model_description}</p>
                  <p>Стоимость модели: {model.model_price}</p>
                  <p>Дата загрузки: {model.upload_date}</p>

                </li>
              ))}
            </ul>
          </div>
      </div>
    </div>
  );
};

export default HomePage;
