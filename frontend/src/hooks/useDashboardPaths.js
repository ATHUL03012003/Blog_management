import { useLocation } from 'react-router-dom';
import { editorPaths } from '../constants/editorPaths';
import { getAdminPaths } from '../constants/adminPaths';

export function useDashboardPaths() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/superadmin')) return getAdminPaths('/superadmin');
  if (pathname.startsWith('/admin')) return getAdminPaths('/admin');
  return editorPaths;
}
