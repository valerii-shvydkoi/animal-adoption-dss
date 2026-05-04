import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePets } from '../hooks/usePets';
import { useAuth } from '../context/AuthContext';
import PetCard from '../components/UI/PetCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ErrorMessage from '../components/UI/ErrorMessage';
import Pagination from '../components/UI/Pagination';

const Catalog = () => {
  const [page, setPage] = useState(1);
  const { pets, loading, error, hasNext, hasPrev } = usePets(page);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleRequestClick = (petId) => {
    if (!user?.isAuthenticated) {
      navigate('/login');
      return;
    }
    console.log('Створення заявки для тварини:', petId);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage detail={error.message} />;

  return (
    <div className="catalog-page">
      <h1>Каталог тварин</h1>
      <div className="pet-grid" style={{ display: 'flex', flexWrap: 'wrap' }}>
        {Array.isArray(pets) && pets.length > 0 ? (
          pets.map((pet) => (
            <PetCard 
              key={pet.id} 
              pet={pet} 
              showRequestButton={true} 
              onRequestClick={handleRequestClick} 
            />
          ))
        ) : (
          <p>Наразі тварин не знайдено.</p>
        )}
      </div>
      <Pagination
        currentPage={page}
        onNext={() => setPage(p => p + 1)}
        onPrev={() => setPage(p => p - 1)}
        hasNext={hasNext}
        hasPrev={hasPrev}
      />
    </div>
  );
};

export default Catalog;
