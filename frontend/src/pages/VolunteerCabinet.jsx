import { useVolunteerCabinet } from '../hooks/useVolunteerCabinet';
import PetForm from '../components/PetForm';

const VolunteerCabinet = () => {
  const { requests, updateStatus } = useVolunteerCabinet();

  return (
    <div>
      <h1>Кабінет Волонтера</h1>
      <PetForm /> {/* Форма додавання нової тварини */}
      
      <h2>Заявки на адопцію (Сортування за %)</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Клієнт</th>
            <th>Тварина</th>
            <th>Відсоток (AHP)</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(req => (
            <tr key={req.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td>{req.user.email}</td>
              <td>{req.pet.name}</td>
              <td><strong>{Math.round(req.score * 100)}%</strong></td>
              <td>
                <select value={req.status} onChange={(e) => updateStatus(req.id, e.target.value)}>
                  <option value="pending">Очікує</option>
                  <option value="approved">Схвалити</option>
                  <option value="rejected">Відхилити</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default VolunteerCabinet;
