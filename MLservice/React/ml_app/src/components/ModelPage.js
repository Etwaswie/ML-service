import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const ModelPage = () => {
    const { id } = useParams();
    const [model, setModel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [userBalance, setUserBalance] = useState(null);
    const navigate = useNavigate();
    const [remainingUsages, setRemainingUsages] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [purchaseAmount, setPurchaseAmount] = useState(1);


    const fetchModelUsages = async () => {
        try {
          const accessToken = Cookies.get('accessToken');
    
          if (!accessToken) {
            return;
          }
    
          const response = await api.get('/api/user/model_usages', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
    
          // Ищем данные для текущей модели
          const modelUsage = response.data.find((item) => item.model_id === model.model_id);
    
          if (modelUsage) {
            setRemainingUsages(modelUsage.remaining_usages);
          }
        } catch (error) {
          console.error('Ошибка при получении данных о счетчике использований:', error);
        }
    };

    useEffect(() => {
        fetchModelUsages();
      }, [model]);
      
    const handleLogout = () => {
        // Отзыв авторизации (удаление токена)
        Cookies.remove('accessToken');

        // Перезагрузка страницы
        window.location.reload();
    };

    const handlePurchase = async () => {
        try {
          const accessToken = Cookies.get('accessToken');
    
          if (!accessToken) {
            throw new Error('Пользователь не авторизован');
          }
    
          const response = await api.post('/api/user/transactions', {
            model_id: model.model_id,
            transaction_amount: purchaseAmount,
          }, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
    
          if (response.data.status === 'success') {
            // Обновите состояние баланса после успешной покупки
            setUserBalance((prevBalance) => prevBalance - purchaseAmount * model.model_price);
            // Обновите состояние счетчика после успешной покупки
            setRemainingUsages((prevUsages) => prevUsages + purchaseAmount);
            console.log('Покупка успешна');
          }
        } catch (error) {
          console.error('Ошибка при покупке использований:', error);
        }
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

    const fetchModel = async () => {
        try {
            const response = await api.get(`/api/models/${id}`);
            setModel(response.data.Model);
        } catch (error) {
            console.error('Ошибка при получении данных о модели:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        try {
          setUploading(true);
    
          const accessToken = Cookies.get('accessToken');
    
          if (!accessToken) {
            throw new Error('Пользователь не авторизован');
          }
    
          const formData = new FormData();
          formData.append('data_file', event.target.files[0]);
    
          const response = await api.post(`/api/models/${model.model_id}`, formData, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'multipart/form-data',
            },
          });
    
          setPrediction(response.data.prediction);
        } catch (error) {
          console.error('Ошибка при отправке файла:', error);
        } finally {
          setUploading(false);
        }
    };
    
    

    useEffect(() => {
        fetchModel();
    }, [id]);

    useEffect(() => {
        fetchUserData();
        fetchUserBalance();
      }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!model) {
        return <p>Модель не найдена</p>;
    }


    return (
        <div>
            <div >
            <nav className='navbar navbar-expand-lg fixed-top clean-navbar navbar-dark bg-primary' >
            <div className='container-fluid'>
                <a className='navbar-brand brand' href='#'>Модель {model.model_name}</a>
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
            <div className='addMargin'>
                <p>Описание: {model.model_description}</p>
                <p>Дата загрузки: {new Date(model.upload_date).toLocaleString()}</p>
                <p>Цена: {model.model_price}</p>
                <p>Оставшиеся использования: {remainingUsages === null ? '0' : remainingUsages}</p>
                <div>
                    <input
                        type="number"
                        value={purchaseAmount}
                        onChange={(e) => setPurchaseAmount(parseInt(e.target.value, 10))}
                    />
                    <button onClick={handlePurchase}>Купить использования</button>
                </div>
                {/* Форма для загрузки файла и кнопка отправки */}
                {remainingUsages > 0 && (
                <div>
                    <input type="file" accept=".csv" onChange={handleFileUpload} />
                    {uploading ? <p>Загрузка...</p> : null}
                    {prediction !== null && <p>Результат предсказания: {prediction}</p>}
                </div>
                )}
                
                {/* Другие поля, которые вы хотите отобразить */}
            </div>
        </div>
    );
};

export default ModelPage;