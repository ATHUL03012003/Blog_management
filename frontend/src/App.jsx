import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ReaderDashboard from './pages/reader/Dashboard';
import AuthorDashboard from './pages/author/Dashboard';
import EditorDashboard from './pages/editor/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import SuperAdminDashboard from './pages/superadmin/Dashboard';
import { Box } from '@mui/material';

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      <ScrollToTop />
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, pt: { xs: 8, sm: 9, md: 9 } }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign-in" element={<Login />} />
          <Route path="/sign-up" element={<Register />} />
          
          {/* Role-based Dashboards */}
          <Route path="/reader/*" element={<ReaderDashboard />} />
          <Route path="/author/*" element={<AuthorDashboard />} />
          <Route path="/editor/*" element={<EditorDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/superadmin/*" element={<SuperAdminDashboard />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
