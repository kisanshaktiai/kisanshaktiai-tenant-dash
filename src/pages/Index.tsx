
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to main app dashboard
  return <Navigate to="/app/dashboard" replace />;
};

export default Index;
