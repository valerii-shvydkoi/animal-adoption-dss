import PropTypes from 'prop-types';
import { getErrorMessage } from '../../utils/errorHandler';

const ErrorMessage = ({ code, detail }) => {
  // Формуємо об'єкт помилки, який зрозуміє наш errorHandler
  const mockError = { response: { data: { code, detail }, status: 400 } };
  const message = code ? getErrorMessage(mockError) : detail || 'Виникла невідома помилка';

  return (
    <div className="error-message" style={{ color: 'red', padding: '10px', border: '1px solid red' }}>
      {message}
    </div>
  );
};

ErrorMessage.propTypes = {
  code: PropTypes.string,
  detail: PropTypes.string,
};

export default ErrorMessage;
