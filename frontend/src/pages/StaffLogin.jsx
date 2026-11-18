import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, ShieldCheck, Mail, RefreshCw } from 'lucide-react';
import './StaffLogin.css';

export default function StaffLogin() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to dispatch verification code');
      }

      setStep(2);
    } catch (err) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setErrorMsg('Backend server not reachable. Please start the backend with: python app.py');
      } else {
        setErrorMsg(err.message || 'Failed to connect to backend server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const finalOtp = otp.join('');
    if (finalOtp.length < 6) {
      setErrorMsg('Enter the full 6-digit code');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: finalOtp })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Invalid or expired OTP');
      }

      const data = await res.json();
      localStorage.setItem('staff_token', data.token);
      localStorage.setItem('staff_email', email.trim().toLowerCase());
      navigate('/support/dashboard');
    } catch (err) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setErrorMsg('Backend server not reachable. Please start the backend with: python app.py');
      } else {
        setErrorMsg(err.message || 'Verification failed. Please check your OTP code.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-viewport">
      <div className="light-haze haze-one"></div>
      <div className="light-haze haze-two"></div>

      <div className="auth-stage">
        <div className="auth-nav-strip">
          <button className="auth-back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={16} />
            <span>Return to Hub</span>
          </button>
          <span className="gate-tag">Staff Authorization</span>
        </div>

        <div className="frosted-glass-box">
          <div className="glass-top-edge"></div>

          <div className="auth-headline-block">
            <div className="shield-icon-badge">
              <ShieldCheck size={24} />
            </div>
            <h2>Staff Portal Sign In</h2>
            <p>Verification passcodes are sent to designated staff email accounts.</p>
          </div>

          {errorMsg && <div className="auth-alert">{errorMsg}</div>}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="auth-stack-form">
              <div className="auth-input-group">
                <label>Authorized Staff Email</label>
                <div className="auth-field-wrapper">
                  <Mail size={18} className="field-adornment" />
                  <input
                    type="email"
                    required
                    placeholder="lalitg6376@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="auth-btn-solid" disabled={isLoading}>
                <span>{isLoading ? 'Verifying...' : 'Send Verification Code'}</span>
                <ArrowUpRight size={18} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="auth-stack-form">
              <div className="auth-input-group">
                <div className="split-label-row">
                  <label>Enter 6-Digit Passcode</label>
                  <span className="sent-to-label">{email}</span>
                </div>
                <div className="otp-boxes-wrapper">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      className="otp-box-cell"
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onFocus={(e) => e.target.select()}
                    />
                  ))}
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#818CF8', textAlign: 'center' }}>
                  Demo testing passcode: <strong>123456</strong>
                </div>
              </div>

              <button type="submit" className="auth-btn-solid" disabled={isLoading}>
                <span>{isLoading ? 'Authenticating...' : 'Access Operations Dashboard'}</span>
                <ArrowUpRight size={18} />
              </button>

              <div className="auth-alt-actions">
                <button
                  type="button"
                  className="resend-trigger"
                  onClick={() => {
                    setOtp(['', '', '', '', '', '']);
                    setStep(1);
                  }}
                >
                  <RefreshCw size={14} />
                  <span>Use different email / Resend</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
