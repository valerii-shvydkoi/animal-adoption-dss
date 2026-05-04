import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAdoptionRequest } from '../hooks/useAdoptionRequest';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cancelRequest } = useAdoptionRequest();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/adoption-requests/');
      setRequests(res.data.results || res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Ви впевнені, що хочете скасувати заявку?')) {
      await cancelRequest(id);
      fetchRequests(); // Оновлюємо список
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="my-requests-page">
      <h2>Мої заявки на адопцію</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
            <th>Тварина</th>
            <th>Статус</th>
            <th>Дата подачі</th>
            <th>Дія</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(req => (
            <tr key={req.id} style={{ borderBottom: '1px solid #ddd', padding: '10px 0' }}>
              <td>{req.pet.name}</td>
              <td>
                <span style={{ 
                  color: req.status === 'pending' ? 'orange' : req.status === 'approved' ? 'green' : 'red' 
                }}>
                  {req.status === 'pending' ? 'Очікує' : req.status === 'approved' ? 'Схвалено' : 'Відхилено/Скасовано'}
                </span>
              </td>
              <td>{new Date(req.created_at).toLocaleDateString()}</td>
              <td>
                {req.status === 'pending' && (
                  <button onClick={() => handleCancel(req.id)} style={{ background: '#dc3545', color: 'white' }}>
                    Скасувати
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default MyRequests;
