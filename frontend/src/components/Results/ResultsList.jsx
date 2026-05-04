import PetCard from '../UI/PetCard';
import ExplainabilityCard from './ExplainabilityCard';

const ResultsList = ({ results }) => (
  <div className="results-container">
    <h3>Тварини, що найбільше вам підходять:</h3>
    {results.map((res) => (
      <div key={res.pet.id} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #eee' }}>
        <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>Сумісність: {Math.round(res.score * 100)}%</div>
        <PetCard pet={res.pet} showRequestButton={true} />
        <ExplainabilityCard pros={res.pros} cons={res.cons} />
      </div>
    ))}
  </div>
);
export default ResultsList;
