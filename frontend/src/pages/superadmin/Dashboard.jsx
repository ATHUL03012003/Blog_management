import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import ReaderLayout from '../../components/reader/ReaderLayout';
import { SUPERADMIN_ROLE } from '../../constants/roles';
import { superadminPaths } from '../../constants/superadminPaths';
import HomeOverview from './HomeOverview';
import Users from './Users';
import AllPosts from './AllPosts';
import PostDetail from './PostDetail';
import ReviewQueue from '../editor/ReviewQueue';
import ReviewPost from '../editor/ReviewPost';
import CategoriesManage from '../editor/CategoriesManage';
import Profile from '../Profile';
import CreatePost from '../editor/CreatePost';
import EditPost from '../editor/EditPost';

export default function SuperAdminDashboard() {
  const paths = superadminPaths;

  return (
    <ProtectedRoute allowedRoles={[SUPERADMIN_ROLE]}>
      <Routes>
        <Route element={<ReaderLayout />}>
          <Route index element={<HomeOverview />} />
          <Route path="users" element={<Users />} />
          <Route path="posts" element={<AllPosts />} />
          <Route path="posts/new" element={<CreatePost paths={paths} />} />
          <Route path="posts/:slug/edit" element={<EditPost paths={paths} />} />
          <Route path="posts/:slug" element={<PostDetail />} />
          <Route path="review" element={<ReviewQueue paths={paths} />} />
          <Route path="review/:slug" element={<ReviewPost paths={paths} />} />
          <Route path="categories" element={<CategoriesManage paths={paths} />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Route>
      </Routes>
    </ProtectedRoute>
  );
}
