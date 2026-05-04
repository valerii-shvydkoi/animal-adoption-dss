import PropTypes from 'prop-types';

const PetStatusBadge = ({ isAvailable }) => {
  if (isAvailable) return null;
  return <span style={{ backgroundColor: '#ffcc00', padding: '4px 8px', borderRadius: '4px' }}>🏠 знайшла дім</span>;
};

PetStatusBadge.propTypes = {
  isAvailable: PropTypes.bool.isRequired,
};

export default PetStatusBadge;
