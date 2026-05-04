import { useState } from 'react';

const VolunteerRequestForm = ({ onSubmit, loading, requestStatus }) => {
  const [formData, setFormData] = useState({ shelter_name: '', address: '', phone: '' });

  if (requestStatus) {
    return (
      <div style={{ padding: '20px', background: '#eef8ff', borderRadius: '8px' }}>
        <h3>Статус вашої заявки: {requestStatus.status}</h3>
        {requestStatus.rejection_reason && <p style={{ color: 'red' }}>Причина: {requestStatus.rejection_reason}</p>}
        {requestStatus.status === 'pending' && <p>Ваша заявка розглядається адміністратором.</p>}
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
      <input placeholder="Назва притулку" required onChange={e => setFormData({...formData, shelter_name: e.target.value})} />
      <input placeholder="Адреса" required onChange={e => setFormData({...formData, address: e.target.value})} />
      <input placeholder="Телефон" required onChange={e => setFormData({...formData, phone: e.target.value})} />
      <button type="submit" disabled={loading}>Подати заявку</button>
    </form>
  );
};
export default VolunteerRequestForm;
