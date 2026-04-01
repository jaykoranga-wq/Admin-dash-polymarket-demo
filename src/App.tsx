import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { CategoriesView } from './components/categories/CategoriesView';
import { DashboardView } from './components/dashboard/DashboardView';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { MarketDetailsPage } from './components/markets/MarketDetailsPage';
import { MarketsView } from './components/markets/MarketsView';
import { ResolutionsView } from './components/resolutions/ResolutionsView';
import { useGetProfileQuery } from './services/authApi';
import { clearCredentials, setAdminProfile } from './store/authSlice';
import type { RootState } from './store';

type AuthScreen = 'login' | 'signup';

const routeByView: Record<string, string> = {
  dashboard: '/',
  categories: '/categories',
  markets: '/markets',
  resolutions: '/resolutions',
  analytics: '/analytics',
};

function AuthenticatedLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isMarketDetailsPage = location.pathname.startsWith('/market/');
  const currentView = isMarketDetailsPage
    ? 'markets'
    : Object.entries(routeByView).find(([, path]) => path === location.pathname)?.[0] ?? 'dashboard';

  return (
    <DashboardLayout
      currentView={currentView}
      pageTitle={isMarketDetailsPage ? 'Market Details' : undefined}
      onViewChange={(view) => navigate(routeByView[view] ?? '/')}
    >
      <Outlet />
    </DashboardLayout>
  );
}

function AuthenticatedApp() {
  const dispatch = useDispatch();
  const { data: profileData, error: profileError } = useGetProfileQuery();

  useEffect(() => {
    if (profileData) {
      dispatch(setAdminProfile(profileData));
    }

    if (profileError) {
      dispatch(clearCredentials());
    }
  }, [dispatch, profileData, profileError]);

  return (
    <Routes>
      <Route element={<AuthenticatedLayout />}>
        <Route path="/" element={<DashboardView />} />
        <Route path="/categories" element={<CategoriesView />} />
        <Route path="/markets" element={<MarketsView />} />
        <Route path="/market/:marketId" element={<MarketDetailsPage />} />
        <Route path="/resolutions" element={<ResolutionsView />} />
        <Route path="/analytics" element={<AnalyticsView />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
