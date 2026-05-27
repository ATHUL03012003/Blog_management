import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import ReaderLayout from '../../components/reader/ReaderLayout';
import HomeOverview from './HomeOverview';
import MyPosts from './MyPosts';
import CreatePost from './CreatePost';
import EditPost from './EditPost';
import PostDetail from './PostDetail';
import Profile from '../Profile';

const AUTHOR_ROLE = 2;

export default function AuthorDashboard() {
  return (
    <ProtectedRoute allowedRoles={[AUTHOR_ROLE]}>
      <Routes>
        <Route element={<ReaderLayout />}>
          <Route index element={<HomeOverview />} />
          <Route path="posts" element={<MyPosts />} />
          <Route path="posts/new" element={<CreatePost />} />
          <Route path="posts/:slug" element={<PostDetail />} />
          <Route path="posts/:slug/edit" element={<EditPost />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/author" replace />} />
        </Route>
      </Routes>
    </ProtectedRoute>
  );
}
