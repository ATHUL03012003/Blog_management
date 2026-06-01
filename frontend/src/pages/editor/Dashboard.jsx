import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import ReaderLayout from '../../components/reader/ReaderLayout';
import HomeOverview from './HomeOverview';
import ReviewQueue from './ReviewQueue';
import ReviewPost from './ReviewPost';
import CategoriesManage from './CategoriesManage';
import MyPosts from './MyPosts';
import CreatePost from './CreatePost';
import EditPost from './EditPost';
import PostDetail from './PostDetail';
import Profile from '../Profile';

const EDITOR_ROLE = 3;

export default function EditorDashboard() {
  return (
    <ProtectedRoute allowedRoles={[EDITOR_ROLE]}>
      <Routes>
        <Route element={<ReaderLayout />}>
          <Route index element={<HomeOverview />} />
          <Route path="review" element={<ReviewQueue />} />
          <Route path="review/:slug" element={<ReviewPost />} />
          <Route path="categories" element={<CategoriesManage />} />
          <Route path="posts" element={<MyPosts />} />
          <Route path="posts/new" element={<CreatePost />} />
          <Route path="posts/:slug" element={<PostDetail />} />
          <Route path="posts/:slug/edit" element={<EditPost />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/editor" replace />} />
        </Route>
      </Routes>
    </ProtectedRoute>
  );
}
