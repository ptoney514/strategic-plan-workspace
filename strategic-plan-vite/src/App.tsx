import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { RootLayout } from './layouts/RootLayout';
import { SystemAdminLayout } from './layouts/SystemAdminLayout';
import { ClientPublicLayout } from './layouts/ClientPublicLayout';
import { ClientAdminLayout } from './layouts/ClientAdminLayout';

// System Admin Pages
import { SystemDashboard } from './pages/admin/SystemDashboard';
import { SystemSettings } from './pages/admin/SystemSettings';

// Client Public Pages
import { HomePage } from './pages/client/public/HomePage';
import { DistrictDashboard } from './pages/client/public/DistrictDashboard';
import { GoalDetail } from './pages/client/public/GoalDetail';
import { MetricsDashboard } from './pages/client/public/MetricsDashboard';

// Client Admin Pages
import { AdminDashboard } from './pages/client/admin/AdminDashboard';
import { AdminGoals } from './pages/client/admin/AdminGoals';
import { AdminMetrics } from './pages/client/admin/AdminMetrics';
import { AdminAudit } from './pages/client/admin/AdminAudit';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root Route - Homepage */}
        <Route path="/" element={<HomePage />} />

        {/* System Admin Routes - /admin */}
        <Route path="/admin" element={<SystemAdminLayout />}>
          <Route index element={<SystemDashboard />} />
          <Route path="settings" element={<SystemSettings />} />
        </Route>

        {/* Client Public Routes - /:slug */}
        <Route path="/:slug" element={<ClientPublicLayout />}>
          <Route index element={<DistrictDashboard />} />
          <Route path="goals/:goalId" element={<GoalDetail />} />
          <Route path="metrics" element={<MetricsDashboard />} />
        </Route>

        {/* Client Admin Routes - /:slug/admin */}
        <Route path="/:slug/admin" element={<ClientAdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="goals" element={<AdminGoals />} />
          <Route path="metrics" element={<AdminMetrics />} />
          <Route path="audit" element={<AdminAudit />} />
        </Route>

        {/* Catch-all redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
