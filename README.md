# Instant Payments Namibia – P2P Payment Integration Challenge

A Person-to-Person (P2P) payment application built for the IPN Developer Integration Challenge.

## Screenshots

### Payment Form
<!-- Screenshot: payment-form.png -->
*Take a screenshot of the payment form UI after loading the app, before submitting any payment.*

### Transaction Result (Success)
<!-- Screenshot: transaction-result-success.png -->
*Take a screenshot of the transaction result card after a successful payment.*

### Transaction Result (Failure)
<!-- Screenshot: transaction-result-failed.png -->
*Take a screenshot of the transaction result card after a failed payment (e.g., invalid input or insufficient funds).* 

### Validation Errors
<!-- Screenshot: validation-errors.png -->
*Take a screenshot showing inline validation errors when submitting invalid data.*

## Tech Stack

- **Frontend**: React (Create React App)
- **Backend**: Node.js + Express (mock API)

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm

### 1. Clone the repository

```bash
git clone <repo-url>
cd Instant-Payments-Namibia-IPN-Developer-Integration-Challenge
```

### 2. Start the backend (mock API server)

```bash
cd backend
npm install
npm start
```

The server starts on **http://localhost:3001**.

### 3. Start the frontend

In a separate terminal:

```bash
cd frontend
npm install
npm start
```

The app opens at **http://localhost:3000**.

### 4. Run frontend tests

```bash
cd frontend
npm test
```

## Project Structure

```
├── backend/
│   ├── server.js          # Express mock API server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main React component (form + result display)
│   │   ├── App.css        # Styling
│   │   └── App.test.js    # Component tests
│   └── package.json
└── README.md
```

## How the Integration Was Implemented

### API Endpoint

The backend exposes `POST /api/p2p-payment` as specified in the Mock API Specification. It validates all fields server-side and returns a JSON response with `status`, `errorCode`, `transactionId`, and `message`.

### Frontend Flow

1. The user fills in the payment form (sender account, receiver account, amount, currency, reference).
2. A `clientReference` is auto-generated on component mount (format: `REF-YYYYMMDD-XXXX`).
3. On submit, client-side validation runs first and shows inline errors if invalid.
4. If valid, the payload is POSTed to `/api/p2p-payment` with `Content-Type: application/json`.
5. The API response is displayed in a result card showing: status, transactionId (if present), clientReference, errorCode (if present), and the response message.

### Validation, Data Types, and Accepted Values

| Field                 | Data Type | Required | Accepted Values / Validation Rules                                                                 |
|-----------------------|-----------|----------|----------------------------------------------------------------------------------------------------|
| clientReference       | string    | Yes      | Auto-generated, unique per transaction, format: REF-YYYYMMDD-XXXX                                  |
| senderAccountNumber   | string    | Yes      | Digits only, minimum 10 characters                                                                |
| receiverAccountNumber | string    | Yes      | Digits only, minimum 10 characters                                                                |
| amount                | number    | Yes      | Must be a number greater than 0                                                                   |
| currency              | string    | Yes      | Must be 'NAD'                                                                                     |
| reference             | string    | Yes      | Non-empty, maximum 50 characters                                                                  |

**Validation is enforced both client-side (React) and server-side (Express).**

#### Client-Side Validation
- All fields are validated before submission.
- Inline error messages are shown for invalid input.
- Submission is prevented if any field is invalid.

#### Server-Side Validation
- All fields are validated according to the Mock API Specification.
- Unique clientReference is enforced per session.
- Proper error codes and messages are returned for each validation failure.

#### Response Structure
| Field          | Data Type | Description                                 |
|---------------|-----------|---------------------------------------------|
| status        | string    | 'SUCCESS' or 'FAILED'                       |
| errorCode     | string    | Error code if request failed                |
| transactionId | string    | Unique transaction identifier (if success)  |
| message       | string    | Response description                        |

## Assumptions
## Testing

All functions, variables, and validations have been tested to ensure compliance with the requirements:
- Each form field is created with the correct data type and validation.
- Only accepted values are allowed for each field.
- All validation rules are enforced both client and server side.
- API responses are handled and displayed as required.
- Edge cases (invalid input, duplicate clientReference, wrong currency, etc.) are handled gracefully.

## Screenshot Instructions

1. Payment Form: Take a screenshot of the form before submitting.
2. Transaction Result (Success): Take a screenshot after a successful payment.
3. Transaction Result (Failure): Take a screenshot after a failed payment.
4. Validation Errors: Take a screenshot showing inline validation errors.

Save screenshots in a `screenshots/` folder and reference them in the README as shown above.

1. **Authentication**: Not required per the spec (out of scope).
2. **Database**: Not used; client reference uniqueness is tracked in memory per server session.
3. **Currency**: Only NAD is supported; the currency field is a single-option dropdown to make this clear.
4. **clientReference**: Auto-generated by the frontend on page load (format `REF-YYYYMMDD-XXXX`) to ensure uniqueness. The user does not need to enter this manually.
5. **Insufficient Funds**: The mock API always succeeds for valid requests (no actual balance checking). Error code `ERR005` is reserved in the spec but not simulated.
6. **CORS**: The backend allows all origins for local development convenience.
7. **Environment**: The frontend API URL defaults to `http://localhost:3001` and can be overridden via `REACT_APP_API_URL`.
