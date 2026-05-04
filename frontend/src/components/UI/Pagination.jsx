import PropTypes from 'prop-types';

const Pagination = ({ currentPage, onNext, onPrev, hasNext, hasPrev }) => {
  return (
    <div className="pagination" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
      <button onClick={onPrev} disabled={!hasPrev}>Попередня</button>
      <span>Сторінка {currentPage}</span>
      <button onClick={onNext} disabled={!hasNext}>Наступна</button>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired,
  hasNext: PropTypes.bool.isRequired,
  hasPrev: PropTypes.bool.isRequired,
};

export default Pagination;
