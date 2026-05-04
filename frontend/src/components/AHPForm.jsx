import { useAHP } from '../hooks/useAHP';
import CRWarning from './UI/CRWarning';

const AHPForm = ({ onResults }) => {
  const { updateMatrix, cr, submitQuestionnaire, loading, error } = useAHP();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await submitQuestionnaire();
    if (data) onResults(data);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Анкета підбору тварини</h2>
      <div style={{ padding: '10px', background: '#f0f4f8', borderRadius: '8px' }}>
        <strong>Поточна узгодженість (CR): {cr.toFixed(3)}</strong>
        <CRWarning cr={cr} />
      </div>

      <section>
        <h3>Безпекові критерії</h3>
        <label>Укриття важливіше за поверх проживання? (1-9)</label>
        <input type="range" min="1" max="9" onChange={(e) => updateMatrix('shelter_floor', e.target.value)} />
      </section>

      <section>
        <h3>Фізіологічні критерії</h3>
        <label>Вага тварини важливіша за її активність? (1-9)</label>
        <input type="range" min="1" max="9" onChange={(e) => updateMatrix('weight_activity', e.target.value)} />
      </section>

      <section>
        <h3>Психологічні критерії</h3>
        <label>Рівень стресу важливіший за соціалізацію? (1-9)</label>
        <input type="range" min="1" max="9" onChange={(e) => updateMatrix('stress_social', e.target.value)} />
      </section>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={loading || cr >= 0.1} style={{ marginTop: '20px', padding: '10px 20px' }}>
        {loading ? 'Обробка...' : 'Знайти ідеальну тварину'}
      </button>
    </form>
  );
};
export default AHPForm;
