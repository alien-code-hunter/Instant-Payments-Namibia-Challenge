import React, { useState } from 'react';
import './App.css';

function generateClientReference() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `REF-${dateStr}-${rand}`;
}

const INITIAL_FORM = {
  senderAccountNumber: '',
  receiverAccountNumber: '',
  amount: '',
  currency: 'NAD',
  reference: '',
};

function validate(form) {
  const errors = {};

  if (!/^\d+$/.test(form.senderAccountNumber)) {
    errors.senderAccountNumber = 'Account number must contain digits only.';
  } else if (form.senderAccountNumber.length < 10) {
    errors.senderAccountNumber = 'Account number must be at least 10 digits.';
  }

  if (!/^\d+$/.test(form.receiverAccountNumber)) {
    errors.receiverAccountNumber = 'Account number must contain digits only.';
  } else if (form.receiverAccountNumber.length < 10) {
    errors.receiverAccountNumber = 'Account number must be at least 10 digits.';
  }

  const amountNum = parseFloat(form.amount);
  if (form.amount === '' || isNaN(amountNum) || amountNum <= 0) {
    errors.amount = 'Amount must be a number greater than 0.';
  }

  if (form.currency !== 'NAD') {
    errors.currency = 'Currency must be NAD.';
  }

  if (!form.reference.trim()) {
    errors.reference = 'Reference must not be empty.';
  } else if (form.reference.length > 50) {
    errors.reference = 'Reference must not exceed 50 characters.';
  }

  return errors;
}

function App() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clientReference, setClientReference] = useState(generateClientReference);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setResult(null);

    const payload = {
      clientReference,
      senderAccountNumber: form.senderAccountNumber,
      receiverAccountNumber: form.receiverAccountNumber,
      amount: parseFloat(form.amount),
      currency: form.currency,
      reference: form.reference,
    };

    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/api/p2p-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setResult({ ...data, clientReference });
    } catch (err) {
      console.error('Payment request failed:', err);
      setResult({
        status: 'FAILED',
        errorCode: 'ERR006',
        transactionId: null,
        clientReference,
        message: 'Unable to reach the payment server. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setForm(INITIAL_FORM);
    setErrors({});
    setResult(null);
    setClientReference(generateClientReference());
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>IPN P2P Payment</h1>
        <p className="subtitle">Instant Payments Namibia</p>
        <p className="subtitle">Person - to - Person Transfer</p>
      </header>

      <main className="app-main">
        {result ? (
          <div className={`result-card ${result.status === 'SUCCESS' ? 'result-success' : 'result-failed'}`}>
            <div className="result-icon">{result.status === 'SUCCESS' ? '✓' : '✗'}</div>
            <h2 className="result-status">{result.status === 'SUCCESS' ? 'Payment Successful' : 'Payment Failed'}</h2>
            <div className="result-details">
              <div className="result-row">
                <span className="result-label">Status</span>
                <span className={`result-value status-badge ${result.status === 'SUCCESS' ? 'badge-success' : 'badge-failed'}`}>
                  {result.status}
                </span>
              </div>
              {result.transactionId && (
                <div className="result-row">
                  <span className="result-label">Transaction ID</span>
                  <span className="result-value mono">{result.transactionId}</span>
                </div>
              )}
              <div className="result-row">
                <span className="result-label">Client Reference</span>
                <span className="result-value mono">{result.clientReference}</span>
              </div>
              {result.errorCode && (
                <div className="result-row">
                  <span className="result-label">Error Code</span>
                  <span className="result-value">{result.errorCode}</span>
                </div>
              )}
              <div className="result-row">
                <span className="result-label">Message</span>
                <span className="result-value">{result.message}</span>
              </div>
            </div>
            <button className="btn btn-secondary" onClick={handleReset}>
              Make Another Payment
            </button>
          </div>
        ) : (
          <form className="payment-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="senderAccountNumber">Sender Account Number</label>
              <input
                id="senderAccountNumber"
                name="senderAccountNumber"
                type="text"
                inputMode="numeric"
                placeholder="e.g. 1234567890"
                value={form.senderAccountNumber}
                onChange={handleChange}
                className={errors.senderAccountNumber ? 'input-error' : ''}
                disabled={loading}
              />
              {errors.senderAccountNumber && (
                <span className="error-msg">{errors.senderAccountNumber}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="receiverAccountNumber">Receiver Account Number</label>
              <input
                id="receiverAccountNumber"
                name="receiverAccountNumber"
                type="text"
                inputMode="numeric"
                placeholder="e.g. 0987654321"
                value={form.receiverAccountNumber}
                onChange={handleChange}
                className={errors.receiverAccountNumber ? 'input-error' : ''}
                disabled={loading}
              />
              {errors.receiverAccountNumber && (
                <span className="error-msg">{errors.receiverAccountNumber}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <div className="input-with-addon">
                <span className="input-addon">NAD</span>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={handleChange}
                  className={errors.amount ? 'input-error' : ''}
                  disabled={loading}
                />
              </div>
              {errors.amount && <span className="error-msg">{errors.amount}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="currency">Currency</label>
              <select
                id="currency"
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className={errors.currency ? 'input-error' : ''}
                disabled={loading}
              >
                <option value="NAD">NAD – Namibian Dollar</option>
              </select>
              {errors.currency && <span className="error-msg">{errors.currency}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="reference">Payment Reference</label>
              <input
                id="reference"
                name="reference"
                type="text"
                maxLength={50}
                placeholder="e.g. Lunch payment"
                value={form.reference}
                onChange={handleChange}
                className={errors.reference ? 'input-error' : ''}
                disabled={loading}
              />
              <span className="char-count">{form.reference.length}/50</span>
              {errors.reference && <span className="error-msg">{errors.reference}</span>}
            </div>

            <div className="form-group client-ref-group">
              <label>Client Reference</label>
              <span className="client-ref-value mono">{clientReference}</span>
              <span className="client-ref-note">Auto-generated unique reference</span>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing…' : 'Submit Payment'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

export default App;
