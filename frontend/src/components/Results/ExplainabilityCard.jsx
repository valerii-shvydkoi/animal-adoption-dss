const ExplainabilityCard = ({ pros = [], cons = [] }) => (
  <div style={{ border: '1px dashed #28a745', padding: '15px', borderRadius: '8px', margin: '10px 0' }}>
    <h4 style={{ color: '#28a745' }}>Чому цей варіант вдалий:</h4>
    <ul>{pros.map((p, i) => <li key={i}>✓ {p}</li>)}</ul>
    <h4 style={{ color: '#dc3545' }}>Можливі складнощі:</h4>
    <ul>{cons.map((c, i) => <li key={i}>✗ {c}</li>)}</ul>
  </div>
);
export default ExplainabilityCard;
