import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';

const API = 'https://blood-bank-management-83j3.onrender.com/api';
const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

export default function AdminDashboard() {
  const { token } = useAuth();
  const [tab, setTab]       = useState('donors');
  const [donors, setDonors] = useState([]);
  const [reqs, setReqs]     = useState([]);
  const [events, setEvents] = useState([]);
  const [banks, setBanks]   = useState([]);
  const [pin, setPin]       = useState('');
  const [bg, setBg]         = useState('');
  const [msg, setMsg]       = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  const loadAll = () => {
    axios.get(`${API}/donor/all`,     { headers }).then(r => setDonors(r.data)).catch(() => {});
    axios.get(`${API}/recipient/all`, { headers }).then(r => setReqs(r.data)).catch(() => {});
    axios.get(`${API}/events`).then(r => setEvents(r.data)).catch(() => {});
    axios.get(`${API}/bloodbank/all`, { headers }).then(r => setBanks(r.data)).catch(() => {});
  };

  useEffect(() => { loadAll(); }, []);

  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3000); };

  const deleteDonor = async id => {
    try {
      await axios.delete(`${API}/donor/${id}`, { headers });
      setDonors(prev => prev.filter(d => d._id !== id));
      showMsg('success', 'Donor removed successfully.');
    } catch { showMsg('error', 'Failed to delete donor.'); }
  };

  const deleteReq = async id => {
    try {
      await axios.delete(`${API}/recipient/${id}`, { headers });
      setReqs(prev => prev.filter(r => r._id !== id));
      showMsg('success', 'Request removed successfully.');
    } catch { showMsg('error', 'Failed to delete request.'); }
  };

  const deleteEvent = async id => {
    try {
      await axios.delete(`${API}/events/${id}`, { headers });
      setEvents(prev => prev.filter(e => e._id !== id));
      showMsg('success', 'Event removed successfully.');
    } catch { showMsg('error', 'Failed to delete event.'); }
  };

  const deleteBank = async id => {
    try {
      await axios.delete(`${API}/bloodbank/${id}`, { headers });
      setBanks(prev => prev.filter(b => b._id !== id));
      showMsg('success', 'Blood bank removed successfully.');
    } catch { showMsg('error', 'Failed to delete blood bank.'); }
  };

  const filteredDonors = donors.filter(d =>
    (!pin || d.pinCode === pin) && (!bg || d.bloodGroup === bg)
  );

  const TABS = [
    ['donors',    `Donors (${donors.length})`],
    ['recipients',`Requests (${reqs.length})`],
    ['banks',     `Blood Banks (${banks.length})`],
    ['events',    `Events (${events.length})`],
  ];

  return (
    <div className="page">
      <Navbar />
      <div className="dashboard">
        <h2>Admin <span>Panel</span></h2>
        <p className="dashboard-sub">Manage donors, requests, blood banks, and events</p>

        {msg && (
          <div className={`alert alert-${msg.type}`} style={{ marginBottom: '1rem' }} onClick={() => setMsg(null)}>
            {msg.text}
          </div>
        )}

        <div className="tabs">
          {TABS.map(([v, l]) => (
            <button key={v} className={`tab-btn ${tab === v ? 'active' : ''}`}
              onClick={() => { setTab(v); setMsg(null); }}>
              {l}
            </button>
          ))}
        </div>

        {/* ── DONORS ── */}
        {tab === 'donors' && (
          <>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: 120 }}>
                <input placeholder="Filter by pin code" value={pin} onChange={e => setPin(e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: 120 }}>
                <select value={bg} onChange={e => setBg(e.target.value)}>
                  <option value="">All blood groups</option>
                  {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div className="data-list">
              {filteredDonors.length === 0 && <div className="empty">No donors found</div>}
              {filteredDonors.map(d => (
                <div key={d._id} className="data-item">
                  <div className="data-item-info">
                    <div className="data-item-title">
                      {d.name}&nbsp;<span className="badge badge-red">{d.bloodGroup}</span>
                    </div>
                    <div className="data-item-sub">{d.phone} · Pin: {d.pinCode} · Age: {d.age} · Weight: {d.weight} kg</div>
                    <div className="data-item-sub">{d.address}</div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteDonor(d._id)}>Delete</button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── REQUESTS ── */}
        {tab === 'recipients' && (
          <div className="data-list">
            {reqs.length === 0 && <div className="empty">No requests found</div>}
            {reqs.map(r => (
              <div key={r._id} className="data-item">
                <div className="data-item-info">
                  <div className="data-item-title">
                    {r.recipientName}&nbsp;—&nbsp;<span className="badge badge-red">{r.bloodGroup}</span>
                  </div>
                  <div className="data-item-sub">{r.units} units · Bank: {r.bloodBankId?.bankName} · {r.recipientPhone}</div>
                  <div className="data-item-sub">
                    <span className={`badge ${r.status === 'approved' ? 'badge-green' : 'badge-gray'}`}>{r.status}</span>
                  </div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => deleteReq(r._id)}>Delete</button>
              </div>
            ))}
          </div>
        )}

        {/* ── BLOOD BANKS ── */}
        {tab === 'banks' && (
          <div className="data-list">
            {banks.length === 0 && <div className="empty">No blood banks registered</div>}
            {banks.map(b => (
              <div key={b._id} className="data-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div className="data-item-info">
                    <div className="data-item-title">{b.bankName}</div>
                    <div className="data-item-sub">{b.address} · Pin: {b.pinCode}</div>
                    {b.userId && (
                      <div className="data-item-sub">
                        Contact: {b.userId.name} · {b.userId.phone} · {b.userId.email}
                      </div>
                    )}
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteBank(b._id)}>Delete</button>
                </div>
                {/* Stock grid */}
                <div style={{ marginTop: '0.75rem', width: '100%' }}>
                  <div className="data-item-sub" style={{ marginBottom: '0.5rem', fontWeight: 600, color: 'var(--muted)' }}>
                    Current Stock (units)
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {BLOOD_GROUPS.map(g => (
                      <div key={g} style={{
                        background: b.stock[g] > 0 ? 'rgba(220,20,60,0.12)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${b.stock[g] > 0 ? 'rgba(220,20,60,0.4)' : 'var(--border)'}`,
                        borderRadius: '8px', padding: '0.35rem 0.65rem', textAlign: 'center', minWidth: 52
                      }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700 }}>{g}</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: b.stock[g] > 0 ? 'var(--red)' : 'var(--muted)' }}>
                          {b.stock[g]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── EVENTS ── */}
        {tab === 'events' && (
          <div className="data-list">
            {events.length === 0 && <div className="empty">No events found</div>}
            {events.map(ev => (
              <div key={ev._id} className="data-item">
                <div className="data-item-info">
                  <div className="data-item-title">{ev.eventName}</div>
                  <div className="data-item-sub">{ev.address} · Pin: {ev.pinCode} · {ev.date}</div>
                  <div className="data-item-sub">Organized by: {ev.organizer}</div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => deleteEvent(ev._id)}>Delete</button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
