import { useVolunteerRequest } from '../hooks/useVolunteerRequest';
import VolunteerRequestForm from '../components/VolunteerRequestForm';

const BecomeVolunteer = () => {
  const { requestStatus, submitRequest, loading } = useVolunteerRequest();

  return (
    <div>
      <h1>Стати волонтером</h1>
      <p>Заповніть заявку, щоб додати свій притулок до нашої системи.</p>
      <VolunteerRequestForm onSubmit={submitRequest} loading={loading} requestStatus={requestStatus} />
    </div>
  );
};
export default BecomeVolunteer;
