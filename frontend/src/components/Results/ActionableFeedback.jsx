const ActionableFeedback = ({ tips = [] }) => (
  <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #ffc107' }}>
    <strong>💡 Рекомендації для вас:</strong>
    <ul>{tips.map((tip, i) => <li key={i}>{tip}</li>)}</ul>
  </div>
);
export default ActionableFeedback;
