import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';

const API = 'https://blood-bank-management-83j3.onrender.com/api';
const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

export default function DonorDashboard() {
  const { user, token } = useAuth();
  const [form, setForm] = useState({ name: user.name, age: '', weight: '', bloodGroup: 'A+', address: '', phone: user.phone, pinCode: user.pinCode });
  const [profile, setProfile] = useState(null);
  const [msg, setMsg] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get(`${API}/donor/me`, { headers }).then(r => { if (r.data) setProfile(r.data); }).catch(() => {});
  }, []);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setMsg(null);
    try {
      const { data } = await axios.post(`${API}/donor/register`, form, { headers });
      setMsg({ type: 'success', text: data.message });
      setProfile(data.donor);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Error' });
    }
  };

  return (
    <div className="page">
      <Navbar />
      <div className="dashboard">
        <h2>Welcome, <span>{user.name}</span></h2>
        <p className="dashboard-sub">Register your availability as a blood donor</p>

        {profile && (
          <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
            You are registered as a <strong>{profile.bloodGroup}</strong> donor. Blood banks can contact you at <strong>{profile.phone}</strong>.
          </div>
        )}

        {msg && <div className={`alert alert-${msg.type}`} style={{ marginBottom: '1rem' }}>{msg.text}</div>}

        <div className="card">
          <form onSubmit={submit} className="section-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input name="name" value={form.name} onChange={handle} placeholder="Your name" required />
              </div>
              <div className="form-group">
                <label>Blood Group</label>
                <select name="bloodGroup" value={form.bloodGroup} onChange={handle}>
                  {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Age (18–65)</label>
                <input name="age" type="number" value={form.age} onChange={handle} placeholder="Your age" required />
              </div>
              <div className="form-group">
                <label>Weight (min 50 kg)</label>
                <input name="weight" type="number" value={form.weight} onChange={handle} placeholder="Weight in kg" required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" value={form.phone} onChange={handle} placeholder="Contact number" required />
              </div>
              <div className="form-group">
                <label>Pin Code</label>
                <input name="pinCode" value={form.pinCode} onChange={handle} placeholder="Area pin code" required />
              </div>
            </div>
            <div className="form-group">
              <label>Address</label>
              <input name="address" value={form.address} onChange={handle} placeholder="Your address" required />
            </div>
            <button type="submit" className="btn btn-primary">
              {profile ? 'Update Registration' : 'Register as Donor'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
