import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LifeBuoy, ShieldCheck, ArrowRight, Layers, CheckCircle } from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-viewport">
      <div className="ambient-spot spot-top"></div>
      <div className="ambient-spot spot-bottom"></div>

      <div className="landing-shell">
        <header className="brand-header">
          <div className="brand-mark">
            <div className="brand-icon-box">
              <Layers size={18} />
            </div>
            <span>SupportDesk</span>
          </div>
          <div className="system-live-pill">
            <span className="dot-pulse"></span>
            <span>Support System Online</span>
          </div>
        </header>

        <main className="content-core">
          <h1 className="headline">Customer Support Portal</h1>
          <p className="sub-headline">
            Submit your technical inquiries or sign in to access the staff operations queue.
          </p>

          <div className="cards-wrapper">
            <div className="glass-card" onClick={() => navigate('/submit-ticket')}>
              <div className="card-shine"></div>
              <div className="card-top-row">
                <div className="card-icon-box blue">
                  <LifeBuoy size={26} strokeWidth={1.75} />
                </div>
                <span className="card-tag">User Portal</span>
              </div>
              <h2>Submit Support Ticket</h2>
              <p>Experiencing system errors, hardware faults, or access problems? Submit your request here.</p>
              
              <div className="card-features">
                <span className="feature-item"><CheckCircle size={14} /> Immediate queue logging</span>
                <span className="feature-item"><CheckCircle size={14} /> Automated routing to support teams</span>
              </div>

              <div className="card-footer-action">
                <span>Continue to Form</span>
                <ArrowRight size={16} />
              </div>
            </div>

            <div className="glass-card" onClick={() => navigate('/staff-login')}>
              <div className="card-shine"></div>
              <div className="card-top-row">
                <div className="card-icon-box purple">
                  <ShieldCheck size={26} strokeWidth={1.75} />
                </div>
                <span className="card-tag staff">Staff Only</span>
              </div>
              <h2>Operations Portal</h2>
              <p>Authorize access to inspect the live ticket queue, review priorities, and resolve requests.</p>

              <div className="card-features">
                <span className="feature-item"><CheckCircle size={14} /> Secure OTP email verification</span>
                <span className="feature-item"><CheckCircle size={14} /> Real-time ticket management</span>
              </div>

              <div className="card-footer-action">
                <span>Staff Sign In</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </div>
        </main>

        <footer className="footer-bar">
          <span>Enterprise IT Support Desk</span>
        </footer>
      </div>
    </div>
  );
}
