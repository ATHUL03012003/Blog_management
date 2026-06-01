import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import ReaderLayout from '../../components/reader/ReaderLayout';
import { ADMIN_ROLE, SUPERADMIN_ROLE } from '../../constants/roles';
import HomeOverview from './HomeOverview';
import Users from './Users';
import AllPosts from './AllPosts';
import ReviewQueue from '../editor/ReviewQueue';
import ReviewPost from '../editor/ReviewPost';
import CategoriesManage from '../editor/CategoriesManage';
import Profile from '../Profile';

const ADMIN_ROLES = [ADMIN_ROLE, SUPERADMIN_ROLE];

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={ADMIN_ROLES}>
      <Routes>
        <Route element={<ReaderLayout />}>
          <Route index element={<HomeOverview />} />
          <Route path="users" element={<Users />} />
          <Route path="posts" element={<AllPosts />} />
          <Route path="review" element={<ReviewQueue />} />
          <Route path="review/:slug" element={<ReviewPost />} />
          <Route path="categories" element={<CategoriesManage allowCategoryDelete />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </ProtectedRoute>
  );
}
