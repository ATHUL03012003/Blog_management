import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import ReaderLayout from '../../components/reader/ReaderLayout';
import { ADMIN_ROLE } from '../../constants/roles';
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
import { useAdminPaths } from '../../hooks/useAdminPaths';

function AdminCreatePost() {
  const paths = useAdminPaths();
  return <CreatePost paths={paths} />;
}

function AdminEditPost() {
  const paths = useAdminPaths();
  return <EditPost paths={paths} />;
}

function AdminReviewQueue() {
  const paths = useAdminPaths();
  return <ReviewQueue paths={paths} />;
}

function AdminReviewPost() {
  const paths = useAdminPaths();
  return <ReviewPost paths={paths} />;
}

function AdminCategories() {
  const paths = useAdminPaths();
  return <CategoriesManage paths={paths} />;
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={[ADMIN_ROLE]}>
      <Routes>
        <Route element={<ReaderLayout />}>
          <Route index element={<HomeOverview />} />
          <Route path="users" element={<Users />} />
          <Route path="posts" element={<AllPosts />} />
          <Route path="posts/new" element={<AdminCreatePost />} />
          <Route path="posts/:slug/edit" element={<AdminEditPost />} />
          <Route path="posts/:slug" element={<PostDetail />} />
          <Route path="review" element={<AdminReviewQueue />} />
          <Route path="review/:slug" element={<AdminReviewPost />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Route>
      </Routes>
    </ProtectedRoute>
  );
}
