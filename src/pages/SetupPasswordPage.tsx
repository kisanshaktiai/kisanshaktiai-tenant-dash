import { Navigate } from 'react-router-dom';

/**
 * SetupPasswordPage - Redirects to Central Authentication Service
 * 
 * Password setup is now handled by the Central Auth Service.
 * This page only exists to handle legacy routes.
 */
const SetupPasswordPage = () => {
  return <Navigate to="/auth" replace />;
};

export default SetupPasswordPage;
export { SetupPasswordPage };
