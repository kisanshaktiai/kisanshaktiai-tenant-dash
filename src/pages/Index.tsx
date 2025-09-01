
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to dashboard (main app entry point)
  return <Navigate to="/dashboard" replace />;
};

export default Index;
