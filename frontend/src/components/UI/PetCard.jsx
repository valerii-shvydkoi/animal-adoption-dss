import PropTypes from 'prop-types';
import PetStatusBadge from './PetStatusBadge';

const PetCard = ({ pet, showRequestButton, onRequestClick }) => {
  return (
    <div className="pet-card" style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', margin: '10px' }}>
      <h3>{pet.name}</h3>
      <PetStatusBadge isAvailable={pet.is_available} />
      <p>Притулок: {pet.shelter?.name}</p>
      
      {showRequestButton && pet.is_available && (
        <button onClick={() => onRequestClick(pet.id)} style={{ marginTop: '10px' }}>
          Хочу цю тварину
        </button>
      )}
    </div>
  );
};

PetCard.propTypes = {
  pet: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    is_available: PropTypes.bool.isRequired,
    shelter: PropTypes.shape({
      name: PropTypes.string,
    }),
  }).isRequired,
  showRequestButton: PropTypes.bool,
  onRequestClick: PropTypes.func,
};

export default PetCard;
