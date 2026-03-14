const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Track used client references to ensure uniqueness for every server session (this covers refreshed sessions).
// NOTE: in-memory store for the mock API only in memory stored only. References reset on server restart
// and will not work across multiple sessions. Database persistence is out of scope per the spec.
const usedClientReferences = new Set();

app.post('/api/p2p-payment', (req, res) => {
  const { clientReference, senderAccountNumber, receiverAccountNumber, amount, currency, reference } = req.body;

  // Check for missing required fields (amount is checked separately as it is numeric)
  const requiredStringFields = ['clientReference', 'senderAccountNumber', 'receiverAccountNumber', 'currency', 'reference'];
  for (const field of requiredStringFields) {
    if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
      return res.status(400).json({
        status: 'FAILED',
        errorCode: 'ERR001',
        transactionId: null,
        message: `Missing required field: ${field}`,
      });
    }
  }

  // Validate amount separately since it is a numeric field
  if (req.body.amount === undefined || req.body.amount === null) {
    return res.status(400).json({
      status: 'FAILED',
      errorCode: 'ERR001',
      transactionId: null,
      message: 'Missing required field: amount',
    });
  }

  // Validate clientReference uniqueness
  if (usedClientReferences.has(clientReference)) {
    return res.status(400).json({
      status: 'FAILED',
      errorCode: 'ERR001',
      transactionId: null,
      message: 'Client reference must be unique per transaction',
    });
  }

  // Validate senderAccountNumber: must be numeric only, minimum length 10
  if (!/^\d+$/.test(senderAccountNumber)) {
    return res.status(400).json({
      status: 'FAILED',
      errorCode: 'ERR002',
      transactionId: null,
      message: 'Invalid account number format: senderAccountNumber must be numeric',
    });
  }
  if (senderAccountNumber.length < 10) {
    return res.status(400).json({
      status: 'FAILED',
      errorCode: 'ERR002',
      transactionId: null,
      message: 'Invalid account number format: senderAccountNumber minimum length is 10',
    });
  }

  // Validate receiverAccountNumber: must be numeric only, minimum length 10
  if (!/^\d+$/.test(receiverAccountNumber)) {
    return res.status(400).json({
      status: 'FAILED',
      errorCode: 'ERR002',
      transactionId: null,
      message: 'Invalid account number format: receiverAccountNumber must be numeric',
    });
  }
  if (receiverAccountNumber.length < 10) {
    return res.status(400).json({
      status: 'FAILED',
      errorCode: 'ERR002',
      transactionId: null,
      message: 'Invalid account number format: receiverAccountNumber minimum length is 10',
    });
  }

  // Validate currency
  if (currency !== 'NAD') {
    return res.status(400).json({
      status: 'FAILED',
      errorCode: 'ERR003',
      transactionId: null,
      message: 'Invalid currency: only NAD is supported',
    });
  }

  // Validate amount
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      status: 'FAILED',
      errorCode: 'ERR004',
      transactionId: null,
      message: 'Invalid amount: must be greater than 0',
    });
  }

  // Validate reference
  if (!reference || reference.trim() === '') {
    return res.status(400).json({
      status: 'FAILED',
      errorCode: 'ERR001',
      transactionId: null,
      message: 'Missing required field: reference must not be empty',
    });
  }
  if (reference.length > 50) {
    return res.status(400).json({
      status: 'FAILED',
      errorCode: 'ERR001',
      transactionId: null,
      message: 'Reference exceeds maximum length of 50 characters',
    });
  }

  // Record the client reference as used
  usedClientReferences.add(clientReference);

  // Generate a unique transaction ID
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(usedClientReferences.size).padStart(4, '0');
  const transactionId = `TXN${dateStr}${seq}`;

  return res.status(200).json({
    status: 'SUCCESS',
    errorCode: null,
    transactionId,
    message: 'Payment processed successfully',
  });
});

app.listen(PORT, () => {
  console.log(`IPN Mock API server running on port ${PORT}`);
});

module.exports = app;
