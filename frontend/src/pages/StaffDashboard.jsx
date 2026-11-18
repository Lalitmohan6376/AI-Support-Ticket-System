import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Inbox,
  ShieldAlert,
  RefreshCw,
  Search,
  X,
  Eye,
  Trash2,
  LogOut,
  Menu,
  Clock,
  AlertCircle,
  CheckCircle,
  Star,
  Send,
  MessageSquare
} from 'lucide-react';
import './StaffDashboard.css';

export default function StaffDashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const staffEmail = localStorage.getItem('staff_email') || 'lalitg6376@gmail.com';

  const fetchTickets = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('http://localhost:8000/api/tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('staff_token');
    if (!token) {
      navigate('/staff-login');
      return;
    }

    fetchTickets();
    const interval = setInterval(() => {
      fetchTickets();
    }, 3500);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleStatusChange = async (ticketId, nextStatus) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: nextStatus } : t));
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(prev => ({ ...prev, status: nextStatus }));
    }

    try {
      await fetch(`http://localhost:8000/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e, ticketId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this ticket permanently?')) return;

    setTickets(prev => prev.filter(t => t.id !== ticketId));
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(null);
    }

    try {
      await fetch(`http://localhost:8000/api/tickets/${ticketId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedTicket) return;

    const noteText = newNote.trim();
    const updatedNotes = [...(selectedTicket.notes || []), noteText];

    setSelectedTicket(prev => ({ ...prev, notes: updatedNotes }));
    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, notes: updatedNotes } : t));
    setNewNote('');

    try {
      await fetch(`http://localhost:8000/api/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteText })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('staff_token');
    localStorage.removeItem('staff_email');
    navigate('/staff-login');
  };

  const filteredTickets = tickets.filter(t => {
    if (activeTab === 'quarantine' && !t.is_spam) return false;
    if (activeTab === 'all' && t.is_spam && statusFilter !== 'Quarantined') return false;

    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && t.priority?.toLowerCase() !== priorityFilter.toLowerCase()) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchNumber = t.ticket_number?.toLowerCase().includes(q);
      const matchSubject = t.subject?.toLowerCase().includes(q);
      const matchName = t.requester_name?.toLowerCase().includes(q);
      const matchEmail = t.requester_email?.toLowerCase().includes(q);
      const matchCategory = t.category?.toLowerCase().includes(q);
      return matchNumber || matchSubject || matchName || matchEmail || matchCategory;
    }
    return true;
  });

  const totalCount = tickets.length;
  const pendingCount = tickets.filter(t => t.status === 'Open').length;
  const highPriorityCount = tickets.filter(t => t.priority?.toLowerCase() === 'high').length;
  const spamCount = tickets.filter(t => t.is_spam).length;

  return (
    <div className="desk-shell">
      {mobileSidebarOpen && (
        <div className="desk-backdrop" onClick={() => setMobileSidebarOpen(false)}></div>
      )}

      <aside className={`desk-sidebar ${mobileSidebarOpen ? 'drawer-open' : ''}`}>
        <div className="desk-brand">
          <div className="brand-badge">
            <Inbox size={20} />
          </div>
          <div className="brand-details">
            <h2>Support Desk</h2>
            <span>Staff Portal</span>
          </div>
          <button className="drawer-close-btn" onClick={() => setMobileSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="desk-navigation">
          <button
            className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => { setActiveTab('all'); setStatusFilter('All'); setMobileSidebarOpen(false); }}
          >
            <Inbox size={18} />
            <span>Ticket Queue</span>
            <span className="badge-count">{totalCount - spamCount}</span>
          </button>

          <button
            className={`nav-link ${activeTab === 'quarantine' ? 'active' : ''}`}
            onClick={() => { setActiveTab('quarantine'); setStatusFilter('All'); setMobileSidebarOpen(false); }}
          >
            <ShieldAlert size={18} />
            <span>Spam Quarantine</span>
            {spamCount > 0 && <span className="badge-count danger">{spamCount}</span>}
          </button>
        </nav>

        <div className="desk-profile">
          <div className="avatar-orb">
            {staffEmail.charAt(0).toUpperCase()}
          </div>
          <div className="profile-text">
            <span className="profile-email">{staffEmail}</span>
            <span className="profile-badge">Authorized Staff</span>
          </div>
          <button className="logout-action-btn" onClick={handleLogout} title="Log Out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="desk-viewport">
        <header className="desk-header">
          <div className="header-left">
            <button className="mobile-menu-trigger" onClick={() => setMobileSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="header-titles">
              <h1>{activeTab === 'quarantine' ? 'Quarantined Threats' : 'Operations Dashboard'}</h1>
              <p>Manage, inspect, and resolve customer support tickets</p>
            </div>
          </div>

          <div className="header-right">
            <div className="pulse-indicator">
              <span className="beacon-ring"></span>
              <span className="beacon-dot"></span>
              <span className="beacon-text">Real-time sync</span>
            </div>
            <button
              className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
              onClick={() => fetchTickets(true)}
              title="Refresh queue"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        <section className="stats-row">
          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-title">Total Workload</span>
              <div className="stat-icon-wrap neutral">
                <Inbox size={18} />
              </div>
            </div>
            <div className="stat-number">{totalCount}</div>
            <span className="stat-footnote">Active records in database</span>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-title">Awaiting Action</span>
              <div className="stat-icon-wrap amber">
                <Clock size={18} />
              </div>
            </div>
            <div className="stat-number">{pendingCount}</div>
            <span className="stat-footnote">Tickets with Open status</span>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-title">High Priority</span>
              <div className="stat-icon-wrap red">
                <AlertCircle size={18} />
              </div>
            </div>
            <div className="stat-number">{highPriorityCount}</div>
            <span className="stat-footnote">Requiring urgent escalation</span>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-title">Spam Quarantined</span>
              <div className="stat-icon-wrap purple">
                <ShieldAlert size={18} />
              </div>
            </div>
            <div className="stat-number">{spamCount}</div>
            <span className="stat-footnote">Blocked security threats</span>
          </div>
        </section>

        <section className="control-toolbar">
          <div className="search-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by ticket #, requester, subject, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className="filter-controls">
            <div className="filter-pills-group">
              {['All', 'Open', 'In Progress', 'Resolved', 'Quarantined'].map(st => (
                <button
                  key={st}
                  className={`status-pill-btn ${statusFilter === st ? 'selected' : ''}`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st}
                </button>
              ))}
            </div>

            <select
              className="priority-filter-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </section>

        <section className="table-card">
          <div className="table-responsive-scroll">
            <table className="desk-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Requester</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Security</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th className="align-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="empty-message-cell">
                      Loading support tickets...
                    </td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-message-cell">
                      No matching tickets found.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map(t => (
                    <tr
                      key={t.id}
                      className="ticket-table-row"
                      onClick={() => setSelectedTicket(t)}
                    >
                      <td className="cell-ticket-id">
                        <span className="code-tag">{t.ticket_number}</span>
                        <span className="ticket-subject-preview" title={t.subject}>{t.subject}</span>
                        <span className="timestamp-text">{t.created_at}</span>
                      </td>

                      <td className="cell-requester">
                        <span className="requester-name">{t.requester_name}</span>
                        <span className="requester-email">{t.requester_email}</span>
                      </td>

                      <td className="cell-category">
                        <span className="category-pill">
                          {t.category || 'General Support'}
                        </span>
                      </td>

                      <td className="cell-priority">
                        <span className={`priority-pill ${t.priority?.toLowerCase()}`}>
                          {(t.priority || 'medium').toUpperCase()}
                        </span>
                      </td>

                      <td className="cell-security">
                        {t.is_spam ? (
                          <span className="security-tag danger">Flagged</span>
                        ) : (
                          <span className="security-tag clean">Clean</span>
                        )}
                      </td>

                      <td className="cell-rating">
                        <div className="rating-wrap">
                          <Star size={13} className="star-icon" />
                          <span>{t.csat_rating || 3}/5</span>
                        </div>
                      </td>

                      <td className="cell-status" onClick={(e) => e.stopPropagation()}>
                        <select
                          className={`status-dropdown-pill ${t.status?.toLowerCase().replace(' ', '-')}`}
                          value={t.status || 'Open'}
                          onChange={(e) => handleStatusChange(t.id, e.target.value)}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Quarantined">Quarantined</option>
                        </select>
                      </td>

                      <td className="cell-actions align-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="action-icon-button"
                          onClick={() => setSelectedTicket(t)}
                          title="Inspect Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="action-icon-button delete"
                          onClick={(e) => handleDelete(e, t.id)}
                          title="Delete Ticket"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="inspector-card" onClick={(e) => e.stopPropagation()}>
            <div className="inspector-head">
              <div className="inspector-head-title">
                <span className="code-tag">{selectedTicket.ticket_number}</span>
                <h3>{selectedTicket.subject}</h3>
              </div>
              <button className="inspector-close-btn" onClick={() => setSelectedTicket(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="inspector-content">
              <div className="inspector-meta-bar">
                <div className="meta-pair">
                  <span className="meta-label">Requester</span>
                  <span className="meta-val">{selectedTicket.requester_name} ({selectedTicket.requester_email})</span>
                </div>
                <div className="meta-pair">
                  <span className="meta-label">Department</span>
                  <span className="meta-val">{selectedTicket.department}</span>
                </div>
                <div className="meta-pair">
                  <span className="meta-label">Logged At</span>
                  <span className="meta-val">{selectedTicket.created_at}</span>
                </div>
              </div>

              <div className="inspector-section">
                <h4>Problem Description</h4>
                <div className="description-text-box">
                  {selectedTicket.description}
                </div>
              </div>

              <div className="inspector-section">
                <h4>Ticket Attributes</h4>
                <div className="attributes-grid">
                  <div className="attribute-card">
                    <span className="attr-label">Category</span>
                    <span className="attr-value">{selectedTicket.category || 'General'}</span>
                  </div>
                  <div className="attribute-card">
                    <span className="attr-label">Priority</span>
                    <span className={`attr-value priority-${selectedTicket.priority?.toLowerCase()}`}>
                      {(selectedTicket.priority || 'Medium').toUpperCase()}
                    </span>
                  </div>
                  <div className="attribute-card">
                    <span className="attr-label">Security Screening</span>
                    <span className={`attr-value ${selectedTicket.is_spam ? 'security-danger' : 'security-clean'}`}>
                      {selectedTicket.is_spam ? 'Suspicious / Flagged' : 'Verified Clean'}
                    </span>
                  </div>
                  <div className="attribute-card">
                    <span className="attr-label">Predicted Rating</span>
                    <span className="attr-value rating-val">
                      <Star size={14} className="star-icon" /> {selectedTicket.csat_rating || 3} / 5
                    </span>
                  </div>
                </div>
              </div>

              <div className="inspector-section">
                <h4>Internal Staff Notes</h4>
                <div className="notes-container">
                  {(!selectedTicket.notes || selectedTicket.notes.length === 0) ? (
                    <div className="no-notes-text">No notes added yet for this ticket.</div>
                  ) : (
                    selectedTicket.notes.map((nt, idx) => (
                      <div key={idx} className="note-bubble">
                        <MessageSquare size={14} className="note-bubble-icon" />
                        <span>{nt}</span>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddNote} className="note-input-form">
                  <input
                    type="text"
                    placeholder="Type an internal note and press Enter..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <button type="submit" disabled={!newNote.trim()}>
                    <Send size={15} />
                    <span>Add Note</span>
                  </button>
                </form>
              </div>
            </div>

            <div className="inspector-footer">
              <div className="footer-status-selector">
                <span>Update Status:</span>
                <select
                  value={selectedTicket.status || 'Open'}
                  onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Quarantined">Quarantined</option>
                </select>
              </div>
              <button className="btn-close-modal" onClick={() => setSelectedTicket(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}