# Job Board - Visual Flow & Testing Guide

## 🔄 User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    JOB BOARD USER FLOW                           │
└─────────────────────────────────────────────────────────────────┘

1. REGISTRATION
   ┌──────────────────────────────────────────┐
   │ POST /api/auth/register                  │
   │ {email, password, firstname, lastname...}│
   └──────────────────────────────────────────┘
              ↓
        Response: token, user
        accountType: "None"
        isVerified: false

2. EMAIL VERIFICATION
   ┌──────────────────────────────────────────┐
   │ GET /api/auth/verify/{verificationToken} │
   │ (Click link in email or use token)       │
   └──────────────────────────────────────────┘
              ↓
        isVerified: true

3. LOGIN
   ┌──────────────────────────────────────────┐
   │ POST /api/auth/login                     │
   │ {email, password}                        │
   └──────────────────────────────────────────┘
              ↓
        Response: NEW token (valid 24hrs)

4. BECOME CREATOR
   ┌──────────────────────────────────────────┐
   │ PUT /api/auth/account-type               │
   │ Header: Authorization: Bearer {token}    │
   │ Body: {accountType: "Creator"}           │
   └──────────────────────────────────────────┘
              ↓
        accountType: "Creator"

5. CREATE JOB
   ┌──────────────────────────────────────────┐
   │ POST /api/jobs                           │
   │ Header: Authorization: Bearer {token}    │
   │ Body: {values, goals, skills...}         │
   └──────────────────────────────────────────┘
              ↓
        Job created successfully!
        id: 1, owner: user_id, proposals: []

6. MANAGE JOBS
   ┌─────────────────────────────────────────────────────┐
   │ VIEW ALL JOBS                                       │
   │ GET /api/jobs (no auth needed)                      │
   │                                                     │
   │ VIEW YOUR JOBS                                      │
   │ GET /api/jobs/my-jobs (requires auth)              │
   │                                                     │
   │ VIEW SPECIFIC JOB                                   │
   │ GET /api/jobs/{id} (no auth needed)                │
   │                                                     │
   │ UPDATE YOUR JOB                                     │
   │ PUT /api/jobs/{id} (requires auth + owner)         │
   │                                                     │
   │ DELETE YOUR JOB                                     │
   │ DELETE /api/jobs/{id} (requires auth + owner)      │
   └─────────────────────────────────────────────────────┘
```

## 🔐 Authentication Matrix

```
╔═════════════════════════════════════════════════════════════════╗
║ ENDPOINT                      │ AUTH  │ Creator │ Owner Only    ║
╠═════════════════════════════════════════════════════════════════╣
║ POST /api/jobs                │ ✅    │ ✅      │ -             ║
║ GET /api/jobs                 │ ❌    │ -       │ -             ║
║ GET /api/jobs/:id             │ ❌    │ -       │ -             ║
║ GET /api/jobs/my-jobs         │ ✅    │ -       │ -             ║
║ PUT /api/jobs/:id             │ ✅    │ -       │ ✅            ║
║ DELETE /api/jobs/:id          │ ✅    │ -       │ ✅            ║
║ POST /api/jobs/:id/proposals  │ ✅    │ -       │ -             ║
║ GET /api/jobs/:id/proposals   │ ✅    │ -       │ ✅            ║
╚═════════════════════════════════════════════════════════════════╝

✅ = Required / ❌ = Not Required / - = Not Applicable
```

## 📋 Request/Response Examples

### REGISTER
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "creator@example.com",
  "password": "SecurePassword123!",
  "firstname": "John",
  "lastname": "Doe",
  "birthday": "1990-01-15",
  "gender": "Male",
  "phone": "+1234567890",
  "city": "New York"
}

RESPONSE (201):
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "creator@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "accountType": "None",
    "isVerified": false,
    "createdAt": "2025-11-16T10:00:00Z"
  }
}
```

### LOGIN
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "creator@example.com",
  "password": "SecurePassword123!"
}

RESPONSE (200):
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "creator@example.com",
    "isVerified": true,
    "accountType": "Creator"
  }
}

⚠️ SAVE THIS TOKEN - Use it for all authenticated requests
```

### UPDATE ACCOUNT TYPE
```
PUT /api/auth/account-type
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "accountType": "Creator"
}

RESPONSE (200):
{
  "message": "Account type updated successfully",
  "user": {
    "id": 1,
    "accountType": "Creator"
  }
}

✅ Now you can post jobs!
```

### CREATE JOB
```
POST /api/jobs
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "values": {
    "title": "Social Media Content Creator",
    "description": "Create viral TikTok videos",
    "location": "Remote",
    "category": "Content Creation",
    "payment": "5000-7000",
    "paymentdesc": "per month"
  },
  "goals": [
    "Produce 10 videos per week",
    "Increase followers by 50%"
  ],
  "skills": [
    "Video Editing",
    "Content Strategy"
  ],
  "contents": [
    "TikTok",
    "Instagram Reels"
  ],
  "platforms": [
    "TikTok",
    "Instagram"
  ]
}

RESPONSE (201):
{
  "message": "Job created successfully",
  "data": {
    "id": 1,
    "owner": 1,
    "owner_email": "creator@example.com",
    "values": { ... },
    "goals": [ ... ],
    "proposals": [],
    "createdAt": "2025-11-16T10:30:00Z"
  }
}
```

### VIEW ALL JOBS (PUBLIC)
```
GET /api/jobs
Content-Type: application/json

No authentication needed!

RESPONSE (200):
{
  "message": "Jobs retrieved successfully",
  "data": [
    {
      "id": 1,
      "owner": 1,
      "owner_email": "creator@example.com",
      "values": { ... },
      ...
    },
    { ... more jobs ... }
  ]
}
```

### VIEW YOUR JOBS
```
GET /api/jobs/my-jobs
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

RESPONSE (200):
{
  "message": "Your jobs retrieved successfully",
  "data": [
    { /* jobs you created */ }
  ]
}
```

## 🧪 Testing Checklist

```
BASIC FLOW:
□ Register user
□ Verify email
□ Login (get token)
□ Update account type to Creator
□ Create job with token
□ View all jobs (public)
□ View your jobs (authenticated)
□ Update your job
□ Delete your job

AUTHENTICATION:
□ Token valid after login
□ Token required for POST /api/jobs
□ Token required for PUT /api/jobs/:id
□ Token required for DELETE /api/jobs/:id
□ Token required for GET /api/jobs/my-jobs
□ Invalid token returns 401

AUTHORIZATION:
□ Can only update own jobs
□ Can only delete own jobs
□ Can only see proposals on own jobs
□ Non-creator cannot create jobs

PUBLIC ACCESS:
□ Can view all jobs without auth
□ Can view specific job without auth

ERROR HANDLING:
□ Missing token → 401 Unauthorized
□ Invalid token → 401 Unauthorized
□ Not owner → 403 Forbidden
□ Not creator → 400 Bad Request
□ Invalid job ID → 404 Not Found
```

## 📱 Using with Postman

1. **Create Collection**: "Job Board API"
2. **Create Variables**:
   - `baseUrl` = http://localhost:5000
   - `token` = (leave empty, will auto-populate)

3. **Create Requests**:
   - Register → Copy token from response
   - Verify Email
   - Login → Copy token to variable
   - Update Account Type
   - Create Job
   - Get All Jobs
   - Get My Jobs
   - Update Job
   - Delete Job

4. **Use Variables**:
   - URL: `{{baseUrl}}/api/jobs`
   - Header: `Authorization: Bearer {{token}}`

## ⚡ Quick Commands

```bash
# Start server
npm run dev

# Run tests
npm test

# Check TypeScript
npx tsc --noEmit

# View logs
npm run dev 2>&1 | grep -E "error|Error|ERROR"
```

---

**For detailed examples**, see:
- `COMPLETE_JOB_BOARD_WORKFLOW.md`
- `JOB_BOARD_TESTING_GUIDE.md`
- `QUICK_REFERENCE_JOB_BOARD.md`
