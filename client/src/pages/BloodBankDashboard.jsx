import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';

const API = 'https://blood-bank-management-83j3.onrender.com/api';
const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const defaultStock = { 'A+':0,'A-':0,'B+':0,'B-':0,'AB+':0,'AB-':0,'O+':0,'O-':0 };

export default function BloodBankDashboard() {
  const { user, token } = useAuth();
  const [tab, setTab]       = useState('stock');
  const [bank, setBank]     = useState(null);
  const [stock, setStock]   = useState(defaultStock);
  const [requests, setReqs] = useState([]);
  const [donors, setDonors] = useState([]);
  const [pinFilter, setPinFilter] = useState('');
  const [event, setEvent]   = useState({ eventName:'', address:'', pinCode:'', date:'' });
  const [msg, setMsg]       = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get(`${API}/bloodbank/me`, { headers }).then(r => { setBank(r.data); if (r.data?.stock) setStock(r.data.stock); }).catch(() => {});
    axios.get(`${API}/bloodbank/requests`, { headers }).then(r => setReqs(r.data)).catch(() => {});
  }, []);

  const saveStock = async () => {
    try {
      await axios.put(`${API}/bloodbank/stock`, { stock }, { headers });
      setMsg({ type: 'success', text: 'Stock saved!' });
    } catch (err) { setMsg({ type: 'error', text: 'Failed to save stock' }); }
  };

  const approve = async (id) => {
    try {
      await axios.put(`${API}/bloodbank/approve/${id}`, {}, { headers });
      setMsg({ type: 'success', text: 'Request approved!' });
      const r = await axios.get(`${API}/bloodbank/requests`, { headers });
      setReqs(r.data);
      const b = await axios.get(`${API}/bloodbank/me`, { headers });
      setBank(b.data); setStock(b.data.stock);
    } catch (err) { setMsg({ type: 'error', text: err.response?.data?.message || 'Error' }); }
  };

  const exploreDonors = async () => {
    const { data } = await axios.get(`${API}/bloodbank/donors`, { params: { pinCode: pinFilter }, headers });
    setDonors(data);
  };

  const addEvent = async e => {
    e.preventDefault();
    try {
      await axios.post(`${API}/bloodbank/event`, event, { headers });
      setMsg({ type: 'success', text: 'Event added!' });
      setEvent({ eventName:'', address:'', pinCode:'', date:'' });
    } catch (err) { setMsg({ type: 'error', text: 'Failed to add event' }); }
  };

  return (
    <div className="page">
      <Navbar />
      <div className="dashboard">
        <h2><span>{bank?.bankName || user.name}</span></h2>
        <p className="dashboard-sub">Pin Code: {bank?.pinCode || user.pinCode}</p>

        {msg && <div className={`alert alert-${msg.type}`} style={{ marginBottom: '1rem' }} onClick={() => setMsg(null)}>{msg.text}</div>}

        <div className="tabs">
          {[['stock','Stock'],['requests','Requests'],['donors','Donors'],['event','Add Event']].map(([v, l]) => (
            <button key={v} className={`tab-btn ${tab === v ? 'active' : ''}`} onClick={() => { setTab(v); setMsg(null); }}>{l}</button>
          ))}
        </div>

        {/* STOCK */}
        {tab === 'stock' && (
          <div className="card">
            <p style={{ marginBottom: '1rem', color: 'var(--muted)', fontSize: '0.88rem' }}>Enter units available for each blood group:</p>
            <div className="stock-grid">
              {BLOOD_GROUPS.map(g => (
                <div key={g} className="stock-item form-group">
                  <label>{g}</label>
                  <input type="number" min="0" value={stock[g] ?? 0}
                    onChange={e => setStock({ ...stock, [g]: parseInt(e.target.value) || 0 })} />
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ marginTop: '1.2rem' }} onClick={saveStock}>Save Stock</button>
          </div>
        )}

        {/* REQUESTS */}
        {tab === 'requests' && (
          <div className="data-list">
            {requests.length === 0 && <div className="empty">No pending requests</div>}
            {requests.map(r => (
              <div key={r._id} className="data-item">
                <div className="data-item-info">
                  <div className="data-item-title">{r.recipientName} — <span className="badge badge-red">{r.bloodGroup}</span></div>
                  <div className="data-item-sub">{r.units} units · {r.recipientPhone}</div>
                </div>
                <button className="btn btn-success btn-sm" onClick={() => approve(r._id)}>Approve</button>
              </div>
            ))}
          </div>
        )}

        {/* DONORS */}
        {tab === 'donors' && (
          <>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <input placeholder="Filter by pin code" value={pinFilter} onChange={e => setPinFilter(e.target.value)} />
              </div>
              <button className="btn btn-secondary" onClick={exploreDonors}>Search</button>
            </div>
            <div className="data-list">
              {donors.length === 0 && <div className="empty">Search donors by pin code above</div>}
              {donors.map(d => (
                <div key={d._id} className="data-item">
                  <div className="data-item-info">
                    <div className="data-item-title">{d.name} <span className="badge badge-red">{d.bloodGroup}</span></div>
                    <div className="data-item-sub">{d.phone} · {d.address}</div>
                  </div>
                  <span className="badge badge-gray">Pin: {d.pinCode}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ADD EVENT */}
        {tab === 'event' && (
          <div className="card">
            <form onSubmit={addEvent} className="section-form">
              <div className="form-group">
                <label>Event Name</label>
                <input value={event.eventName} onChange={e => setEvent({ ...event, eventName: e.target.value })} placeholder="e.g. Blood Donation Camp" required />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input value={event.address} onChange={e => setEvent({ ...event, address: e.target.value })} placeholder="Event address" required />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Pin Code</label>
                  <input value={event.pinCode} onChange={e => setEvent({ ...event, pinCode: e.target.value })} placeholder="Pin code" required />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={event.date} onChange={e => setEvent({ ...event, date: e.target.value })} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Add Event</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
