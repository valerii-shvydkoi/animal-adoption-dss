const EmailStatusNotice = ({ email }) => (
  <div
    style={{
      padding: '10px',
      background: '#d1ecf1',
      color: '#0c5460',
      borderRadius: '4px',
    }}
  >
    📧 Ми надіслали лист із деталями на вашу пошту: <strong>{email}</strong>
  </div>
);
export default EmailStatusNotice;
