import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash, state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const sectionId = state?.scrollTo || hash.replace('#', '');

    if (sectionId) {
      const timer = setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (state?.scrollTo) {
          navigate(pathname, { replace: true, state: {} });
        }
      }, 150);
      return () => clearTimeout(timer);
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash, state?.scrollTo, navigate]);

  return null;
}
