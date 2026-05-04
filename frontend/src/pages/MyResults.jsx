import { useEffect, useState } from 'react';
import api from '../services/api';
import ResultsList from '../components/Results/ResultsList';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const MyResults = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/results/').then(res => {
      setData(res.data.results || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Історія моїх підборів</h1>
      {data.length > 0 ? <ResultsList results={data} /> : <p>Ви ще не проходили анкетування.</p>}
    </div>
  );
};
export default MyResults;
