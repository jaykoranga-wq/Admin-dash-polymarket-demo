import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from './store';
import { setAdminProfile, clearCredentials } from './store/authSlice';
import { useGetProfileQuery } from './services/authApi';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardView } from './components/dashboard/DashboardView';
import { CategoriesView } from './components/categories/CategoriesView';
import { MarketsView } from './components/markets/MarketsView';
import { ResolutionsView } from './components/resolutions/ResolutionsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';

type AuthScreen = 'login' | 'signup';

/** Inner component rendered only when authenticated — fetches profile on mount */
function AuthenticatedApp() {
  const dispatch = useDispatch();
  const [currentView, setCurrentView] = useState('dashboard');

  // Fetch admin profile whenever we have a token (also re-hydrates after page refresh)
  const { data: profileData, error: profileError } = useGetProfileQuery();

  useEffect(() => {
    if (profileData) {
      dispatch(setAdminProfile(profileData));
    }
    // If profile fetch fails (e.g. expired token), clear session
    if (profileError) {
      dispatch(clearCredentials());
    }
  }, [profileData, profileError, dispatch]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':   return <DashboardView />;
      case 'categories':  return <CategoriesView />;
      case 'markets':     return <MarketsView />;
      case 'resolutions': return <ResolutionsView />;
      case 'analytics':   return <AnalyticsView />;
      default:            return <DashboardView />;
    }
  };

  return (
    <DashboardLayout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </DashboardLayout>
  );
}

function App() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');

  if (!isAuthenticated) {
    if (authScreen === 'signup') {
      return <SignupForm onSwitchToLogin={() => setAuthScreen('login')} />;
    }
    return <LoginForm onSwitchToSignup={() => setAuthScreen('signup')} />;
  }

  return <AuthenticatedApp />;
}

export default App;
