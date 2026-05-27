import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import ReaderLayout from '../../components/reader/ReaderLayout';
import HomeOverview from './HomeOverview';
import ReadBlogs from './ReadBlogs';
import BlogReader from './BlogReader';
import CategoriesBrowse from './CategoriesBrowse';
import Profile from '../Profile';

const READER_ROLE = 1;

export default function ReaderDashboard() {
  return (
    <ProtectedRoute allowedRoles={[READER_ROLE]}>
      <Routes>
        <Route element={<ReaderLayout />}>
          <Route index element={<HomeOverview />} />
          <Route path="read" element={<ReadBlogs />} />
          <Route path="read/:slug" element={<BlogReader />} />
          <Route path="categories" element={<CategoriesBrowse />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/reader" replace />} />
        </Route>
      </Routes>
    </ProtectedRoute>
  );
}
