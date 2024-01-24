import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Cookies from 'js-cookie';

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [modelFile, setModelFile] = useState(null);
  const [modelDescription, setModelDescription] = useState('');
  const [modelPrice, setModelPrice] = useState('');
  const [modelsList, setModelsList] = useState([]);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Отзыв авторизации (удаление токена)
    Cookies.remove('accessToken');

    // Перезагрузка страницы
    window.location.reload();
  };

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


  const fetchModelsList = async () => {
    try {
      const accessToken = Cookies.get('accessToken');
  
      if (!accessToken) {
        return;
      }
  
      const response = await api.get('/api/models/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      setModelsList(response.data);
    } catch (error) {
      console.error('Ошибка при получении списка моделей:', error);
    }
  };

  const handleAddMoney = async () => {
    try {
      const accessToken = Cookies.get('accessToken');

      if (!accessToken || !amountToAdd) {
        console.error('Токен отсутствует или не указана сумма');
        return;
      }

      await api.put(
        `/api/user/add_money`,
        { amount: parseInt(amountToAdd) },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      fetchUserBalance();

      setAmountToAdd('');
    } catch (error) {
      console.error('Ошибка при пополнении баланса:', error);
    }
  };

  const handleFileChange = (e) => {
    setModelFile(e.target.files[0]);
  };

  const handleDescriptionChange = (e) => {
    setModelDescription(e.target.value);
  };

  const handlePriceChange = (e) => {
    setModelPrice(e.target.value);
  };

  const handleDelete = async (id) => {
    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken || !id) {
        console.error('Токен отсутствует или не указан id модели');
        return;
      }

      await api.delete(`/api/models/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Обновите список моделей после успешного удаления
      fetchModelsList();
    } catch (error) {
      console.error('Ошибка при удалении модели:', error);
    }
  };

  const handleModelUpload = async () => {
    try {
      const accessToken = Cookies.get('accessToken');

      if (!accessToken || !modelFile) {
        console.error('Токен отсутствует или не выбран файл');
        return;
      }

      const formData = new FormData();
      formData.append('model_file', modelFile);
      formData.append('model_description', modelDescription);
      formData.append('model_price', modelPrice)

      await api.post('/api/admin/upload_model', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Дополнительные действия после успешной загрузки
      window.location.reload();
    } catch (error) {
      console.error('Ошибка при загрузке модели:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchUserBalance();
    fetchModelsList();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div >
        <nav className='navbar navbar-expand-lg fixed-top clean-navbar navbar-dark bg-primary' >
          <div className='container-fluid'>
              <a className='navbar-brand brand' href='#'>Личный кабинет</a>
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
      </div>
      {userData ? (
        <div class='addMargin'>
            <div classname='md-3 px-2' >
              <input className='from-control'
                type='number'
                id='amountToAdd'
                placeholder='Сумма пополнения'
                value={amountToAdd}
                onChange={(e) => setAmountToAdd(e.target.value)}
              />
            </div>
            <div className='mb-3'>
              <button className='btn btn-primary' onClick={handleAddMoney}>Подтвердить</button>
            </div>
          
          {userData.role === 'admin' && (
            <div>
              <div>
                <label htmlFor='modelFile'>Файл модели: </label>
                <input type='file' id='modelFile' onChange={handleFileChange} />
                <input
                  type='text'
                  placeholder='Описание модели'
                  onChange={handleDescriptionChange}
                />
                <input
                  type='number'
                  placeholder='Цена использования'
                  onChange={handlePriceChange}
                />
                <button onClick={handleModelUpload}>Загрузить модель</button>
              </div>
              <div>
                <h2>Список моделей:</h2>
                <ul>
                  {modelsList.map((model) => (
                    <li key={model.model_id}>
                      <strong>{model.model_name}</strong>: {model.model_description}
                      <p>Стоимость модели: {model.model_price}</p>
                      <p>{model.upload_date}</p>
                      <button className='btn btn-primary' onClick={() => handleDelete(model.model_id)}>Удалить модель</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      ) : (
        navigate('/auth')
      )}
    </div>
  );
};

export default UserDashboard;
