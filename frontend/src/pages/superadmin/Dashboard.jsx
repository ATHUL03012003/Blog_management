import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import ReaderLayout from '../../components/reader/ReaderLayout';
import { SUPERADMIN_ROLE } from '../../constants/roles';
import HomeOverview from '../admin/HomeOverview';
import Users from '../admin/Users';
import AllPosts from '../admin/AllPosts';
import ReviewQueue from '../editor/ReviewQueue';
import ReviewPost from '../editor/ReviewPost';
import CategoriesManage from '../editor/CategoriesManage';
import Profile from '../Profile';

export default function SuperAdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={[SUPERADMIN_ROLE]}>
      <Routes>
        <Route element={<ReaderLayout />}>
          <Route index element={<HomeOverview />} />
          <Route path="users" element={<Users />} />
          <Route path="posts" element={<AllPosts />} />
          <Route path="review" element={<ReviewQueue />} />
          <Route path="review/:slug" element={<ReviewPost />} />
          <Route path="categories" element={<CategoriesManage allowCategoryDelete />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/superadmin" replace />} />
        </Route>
      </Routes>
    </ProtectedRoute>
  );
}
