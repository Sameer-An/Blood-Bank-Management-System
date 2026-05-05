import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = 'http://localhost:5000/api';
const ROLES = [
  { value: 'donor',     label: 'Donor' },
  { value: 'recipient', label: 'Find Blood' },
  { value: 'bloodbank', label: 'Blood Bank' },
  { value: 'admin',     label: 'Admin' },
];

export default function AuthPage() {
  const [mode, setMode]       = useState('login');
  const [role, setRole]       = useState('donor');
  const [form, setForm]       = useState({ name:'', email:'', phone:'', pinCode:'', password:'', bankName:'' });
  const [msg, setMsg]         = useState(null);
  const [events, setEvents]   = useState([]);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  useEffect(() => {
    axios.get(`${API}/events`).then(r => setEvents(r.data)).catch(() => {});
  }, []);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setMsg(null);
    try {
      if (mode === 'register') {
        const payload = { ...form, role };
        await axios.post(`${API}/auth/register`, payload);
        setMsg({ type: 'success', text: 'Registered! Please login.' });
        setMode('login');
      } else {
        const { data } = await axios.post(`${API}/auth/login`, { email: form.email, password: form.password });
        login(data.user, data.token);
        navigate(`/${data.user.role}`);
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Something went wrong' });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-header">
          <h1>Blood Management <span>System</span></h1>
          <p>Connecting donors, recipients and blood banks</p>
        </div>

        <div className="auth-toggle">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setMsg(null); }}>Login</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setMsg(null); }}>Register</button>
        </div>

        <div className="card">
          {msg && <div className={`alert alert-${msg.type}`} style={{ marginBottom: '1rem' }}>{msg.text}</div>}

          {mode === 'register' && (
            <>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>Select your role:</p>
              <div className="role-grid" style={{ marginBottom: '1rem' }}>
                {ROLES.filter(r => r.value !== 'admin').map(r => (
                  <div key={r.value} className={`role-card ${role === r.value ? 'selected' : ''}`} onClick={() => setRole(r.value)}>
                    <div className="role-label">{r.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {mode === 'register' && (
              <>
                <div className="form-group">
                  <label>Full Name</label>
                  <input name="name" value={form.name} onChange={handle} placeholder="Your name" required />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Phone</label>
                    <input name="phone" value={form.phone} onChange={handle} placeholder="Phone number" required />
                  </div>
                  <div className="form-group">
                    <label>Pin Code</label>
                    <input name="pinCode" value={form.pinCode} onChange={handle} placeholder="Area pin code" required />
                  </div>
                </div>
                {role === 'bloodbank' && (
                  <div className="form-group">
                    <label>Bank Name</label>
                    <input name="bankName" value={form.bankName} onChange={handle} placeholder="Blood bank name" />
                  </div>
                )}
              </>
            )}
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handle} placeholder="your@email.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input name="password" type="password" value={form.password} onChange={handle} placeholder="Password" required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              {mode === 'login' ? 'Login →' : 'Create Account'}
            </button>
          </form>
        </div>

        {events.length > 0 && (
          <div className="events-strip">
            <h4>Upcoming Donation Camps</h4>
            {events.slice(0, 3).map(ev => (
              <div key={ev._id} className="event-chip">
                <strong>{ev.eventName}</strong>
                <p>{ev.address} · {ev.pinCode} · {ev.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
