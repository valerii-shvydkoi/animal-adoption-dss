const CRWarning = ({ cr }) => {
  if (cr < 0.1) return null;
  return (
    <div
      style={{
        color: '#721c24',
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        padding: '12px',
        borderRadius: '4px',
        margin: '10px 0',
      }}
    >
      <strong>⚠️ Увага:</strong> Ваші відповіді мають низьку узгодженість (CR = {cr.toFixed(2)}).
      Для точного результату цей показник має бути меншим за 0.1.
    </div>
  );
};
export default CRWarning;
