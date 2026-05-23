const ExplainabilityCard = ({ pros = [], cons = [] }) => (
  <div
    style={{
      border: '1px solid #E2E8F0',
      backgroundColor: '#F8FAFC',
      padding: '16px',
      borderRadius: '12px',
      marginTop: '20px',
    }}
  >
    {pros && pros.length > 0 && (
      <div
        style={{
          marginBottom: cons && cons.length > 0 ? '12px' : '0',
        }}
      >
        <h4
          style={{
            color: '#16A34A',
            margin: '0 0 8px 0',
            fontSize: '15px',
            fontWeight: '800',
          }}
        >
          Чому цей варіант вдалий:
        </h4>
        <ul
          style={{
            margin: 0,
            paddingLeft: '20px',
            color: '#475569',
            fontSize: '14px',
            lineHeight: '1.4',
          }}
        >
          {pros.map((p, i) => (
            <li
              key={i}
              style={{
                marginBottom: '4px',
              }}
            >
              {p}
            </li>
          ))}
        </ul>
      </div>
    )}

    {cons && cons.length > 0 && (
      <div>
        <h4
          style={{
            color: '#DC2626',
            margin: '0 0 8px 0',
            fontSize: '15px',
            fontWeight: '800',
          }}
        >
          Можливі складнощі:
        </h4>
        <ul
          style={{
            margin: 0,
            paddingLeft: '20px',
            color: '#475569',
            fontSize: '14px',
            lineHeight: '1.4',
          }}
        >
          {cons.map((c, i) => (
            <li
              key={i}
              style={{
                marginBottom: '4px',
              }}
            >
              {c}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);
export default ExplainabilityCard;
