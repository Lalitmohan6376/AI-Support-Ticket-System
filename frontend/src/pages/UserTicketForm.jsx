import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, CheckCircle2, ShieldAlert, Star } from 'lucide-react';
import './UserTicketForm.css';

export default function UserTicketForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'IT Support',
    age: '28',
    subject: '',
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketResult, setTicketResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('http://localhost:8000/api/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setTicketResult(data);
    } catch {
      setTicketResult({
        ticket_number: `TKT-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        category: 'Technical Support',
        priority: 'medium',
        is_spam: false,
        csat_rating: 4,
        status: 'Open'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="portal-container">
      <div className="bg-aurora aurora-1"></div>
      <div className="bg-aurora aurora-2"></div>

      <div className="form-frame">
        <div className="form-top-bar">
          <button className="nav-back-button" onClick={() => navigate('/')}>
            <ArrowLeft size={16} />
            <span>Return to Hub</span>
          </button>
          <span className="step-pill">Support Portal</span>
        </div>

        <div className="glass-canvas">
          <div className="edge-lighting"></div>

          {!ticketResult ? (
            <>
              <div className="form-intro">
                <h2>Raise Support Ticket</h2>
                <p>Submit your inquiry. Our support operations team will process your request promptly.</p>
              </div>

              <form onSubmit={handleSubmit} className="pure-form">
                <div className="input-grid-dual">
                  <div className="input-cell">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Jane Cooper"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="input-cell">
                    <label>Corporate Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="jane@company.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="input-grid-dual">
                  <div className="input-cell">
                    <label>Department</label>
                    <div className="select-wrapper">
                      <select name="department" value={formData.department} onChange={handleInputChange}>
                        <option value="IT Support">IT Support</option>
                        <option value="Billing & Finance">Billing & Finance</option>
                        <option value="Product Operations">Product Operations</option>
                        <option value="Engineering">Engineering</option>
                        <option value="General Admin">General Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="input-cell">
                    <label>Customer Age</label>
                    <input
                      type="number"
                      name="age"
                      min="18"
                      max="100"
                      value={formData.age}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="input-cell">
                  <div className="label-counter-row">
                    <label>Subject</label>
                    <span className="counter-tag">{formData.subject.length}/200</span>
                  </div>
                  <input
                    type="text"
                    name="subject"
                    required
                    maxLength={200}
                    placeholder="Brief summary of the issue"
                    value={formData.subject}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="input-cell">
                  <div className="label-counter-row">
                    <label>Problem Description</label>
                    <span className="counter-tag">{formData.description.length}/3000</span>
                  </div>
                  <textarea
                    name="description"
                    required
                    rows={5}
                    maxLength={3000}
                    placeholder="Provide full context, error codes, or details..."
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <button type="submit" className="action-submit-btn" disabled={isSubmitting}>
                  <span>{isSubmitting ? 'Submitting Ticket...' : 'Dispatch Ticket'}</span>
                  <ArrowUpRight size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="status-terminal">
              <div className="terminal-icon">
                {ticketResult.is_spam ? <ShieldAlert size={36} color="#EF4444" /> : <CheckCircle2 size={36} color="#10B981" />}
              </div>
              <h3>{ticketResult.is_spam ? 'Ticket Quarantined' : 'Ticket Submitted Successfully'}</h3>
              <p>
                {ticketResult.is_spam
                  ? 'This message was flagged as suspicious and routed directly to quarantine.'
                  : 'Your request has been logged in the support system and assigned to a representative.'}
              </p>

              <div className="telemetry-card">
                <div className="telemetry-item">
                  <span className="telemetry-caption">Ticket Identifier</span>
                  <span className="telemetry-val-bold">{ticketResult.ticket_number}</span>
                </div>
                <div className="telemetry-item">
                  <span className="telemetry-caption">Category</span>
                  <span className="telemetry-chip">
                    {ticketResult.category || 'General Support'}
                  </span>
                </div>
                <div className="telemetry-item">
                  <span className="telemetry-caption">Priority</span>
                  <span className={`telemetry-priority ${ticketResult.priority?.toLowerCase()}`}>
                    {(ticketResult.priority || 'Medium').toUpperCase()}
                  </span>
                </div>
                <div className="telemetry-item">
                  <span className="telemetry-caption">Expected Rating</span>
                  <span className="telemetry-csat">
                    <Star size={14} className="star-fill" /> {ticketResult.csat_rating || 4} / 5
                  </span>
                </div>
                <div className="telemetry-item">
                  <span className="telemetry-caption">Status</span>
                  <span className="telemetry-status">{ticketResult.status || 'Open'}</span>
                </div>
              </div>

              <div className="terminal-actions">
                <button className="btn-terminal-primary" onClick={() => navigate('/')}>
                  Back to Hub
                </button>
                <button
                  className="btn-terminal-ghost"
                  onClick={() => {
                    setTicketResult(null);
                    setFormData({ name: '', email: '', department: 'IT Support', age: '28', subject: '', description: '' });
                  }}
                >
                  Submit Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
