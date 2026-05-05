import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';

const API = 'http://localhost:5000/api';
const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

export default function RecipientDashboard() {
  const { user, token } = useAuth();
  const [search, setSearch] = useState({ bloodGroup: 'A+', units: 1, pinCode: user.pinCode });
  const [banks, setBanks]   = useState(null);
  const [myReqs, setMyReqs] = useState([]);
  const [msg, setMsg]       = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get(`${API}/recipient/my-requests`, { headers }).then(r => setMyReqs(r.data)).catch(() => {});
  }, []);

  const handleSearch = e => setSearch({ ...search, [e.target.name]: e.target.value });

  const doSearch = async e => {
    e.preventDefault();
    setMsg(null);
    try {
      const { data } = await axios.get(`${API}/recipient/search`, { params: search, headers });
      setBanks(data);
      if (data.length === 0) setMsg({ type: 'info', text: 'No blood banks found with that blood group and units in your pin code area.' });
    } catch (err) { setMsg({ type: 'error', text: 'Search failed' }); }
  };

  const sendRequest = async (bankId) => {
    setMsg(null);
    try {
      const { data } = await axios.post(`${API}/recipient/request`, { bloodBankId: bankId, bloodGroup: search.bloodGroup, units: search.units }, { headers });
      setMsg({ type: 'success', text: data.message });
      setBanks(null);
      const r = await axios.get(`${API}/recipient/my-requests`, { headers });
      setMyReqs(r.data);
    } catch (err) { setMsg({ type: 'error', text: err.response?.data?.message || 'Error' }); }
  };

  return (
    <div className="page">
      <Navbar />
      <div className="dashboard">
        <h2>Find <span>Blood</span></h2>
        <p className="dashboard-sub">Search available blood banks near you</p>

        {msg && <div className={`alert alert-${msg.type}`} style={{ marginBottom: '1rem' }}>{msg.text}</div>}

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <form onSubmit={doSearch} className="section-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Blood Group Needed</label>
                <select name="bloodGroup" value={search.bloodGroup} onChange={handleSearch}>
                  {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Units Needed</label>
                <input name="units" type="number" min="1" value={search.units} onChange={handleSearch} />
              </div>
              <div className="form-group">
                <label>Pin Code</label>
                <input name="pinCode" value={search.pinCode} onChange={handleSearch} placeholder="Area pin code" required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Search Blood Banks</button>
          </form>
        </div>

        {banks !== null && banks.length > 0 && (
          <>
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--muted)' }}>Available Blood Banks</h3>
            <div className="data-list" style={{ marginBottom: '1.5rem' }}>
              {banks.map(b => (
                <div key={b._id} className="data-item">
                  <div className="data-item-info">
                    <div className="data-item-title">{b.bankName}</div>
                    <div className="data-item-sub">{b.address} · Pin: {b.pinCode}</div>
                    <div className="data-item-sub">
                      <span className="badge badge-green">{search.bloodGroup}: {b.stock[search.bloodGroup]} units</span>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => sendRequest(b._id)}>Send Request</button>
                </div>
              ))}
            </div>
          </>
        )}

        {myReqs.length > 0 && (
          <>
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--muted)' }}>My Requests</h3>
            <div className="data-list">
              {myReqs.map(r => (
                <div key={r._id} className="data-item">
                  <div className="data-item-info">
                    <div className="data-item-title">{r.bloodGroup} · {r.units} units</div>
                    <div className="data-item-sub">Bank: {r.bloodBankId?.bankName || 'Unknown'}</div>
                  </div>
                  <span className={`badge ${r.status === 'approved' ? 'badge-green' : r.status === 'rejected' ? 'badge-red' : 'badge-gray'}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
