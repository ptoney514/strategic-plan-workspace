import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { DistrictDashboard } from './pages/DistrictDashboard';
import { GoalDetail } from './pages/GoalDetail';
import { MetricsDashboard } from './pages/MetricsDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminGoals } from './pages/AdminGoals';
import { AdminMetrics } from './pages/AdminMetrics';
import { AdminAudit } from './pages/AdminAudit';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:slug" element={<DistrictDashboard />} />
        <Route path="/:slug/metrics" element={<MetricsDashboard />} />
        <Route path="/:slug/goals/:goalId" element={<GoalDetail />} />
        
        {/* Admin Routes */}
        <Route path="/:slug/admin" element={<AdminDashboard />} />
        <Route path="/:slug/admin/goals" element={<AdminGoals />} />
        <Route path="/:slug/admin/metrics" element={<AdminMetrics />} />
        <Route path="/:slug/admin/audit" element={<AdminAudit />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App