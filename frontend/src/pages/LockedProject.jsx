import { Navigate, useSearchParams } from 'react-router-dom';
import NotFound from './NotFound';

export default function LockedProject() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('id');

  if (!projectId) {
    return <NotFound />;
  }

  return <Navigate to={`/project/${projectId}`} replace state={{ isLocked: true }} />;
}
