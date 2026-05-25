import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { FeedbackProvider } from './context/FeedbackContext';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')).render(
  <FeedbackProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </FeedbackProvider>
);
