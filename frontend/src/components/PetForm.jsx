import { useState } from 'react';
import api from '../services/api';

const PetForm = ({ pet, onSuccess }) => {
  // Базові стани
  const [formData, setFormData] = useState(pet || { name: '', size: 3, activity: 3 });

  const handleSoftDelete = async () => {
    if (window.confirm('Видалити тварину (приховати з каталогу)?')) {
      await api.patch(`/pets/${pet.id}/`, { is_available: false });
      if (onSuccess) onSuccess();
    }
  };

  return (
    <form style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px' }}>
      <h3>{pet ? 'Редагувати тварину' : 'Додати тварину'}</h3>
      <label>
        Рівень активності (1-5): {formData.activity}
        <input type="range" min="1" max="5" value={formData.activity} 
               onChange={e => setFormData({...formData, activity: e.target.value})} />
      </label>
      {pet && <button type="button" onClick={handleSoftDelete} style={{ background: 'red', color: 'white', marginTop: '10px' }}>Видалити (Soft Delete)</button>}
    </form>
  );
};
export default PetForm;
