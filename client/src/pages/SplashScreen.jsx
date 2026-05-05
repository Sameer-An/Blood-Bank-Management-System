import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => {
      navigate(user ? `/${user.role}` : '/auth');
    }, 2800);
    return () => clearTimeout(t);
  }, [navigate, user]);

  return (
    <div className="splash">
      <div className="splash-title">Blood Management <span>System</span></div>
      <p className="splash-sub">Connecting donors, recipients and blood banks</p>
      <div className="splash-bar">
        <div className="splash-bar-fill" />
      </div>
    </div>
  );
}
