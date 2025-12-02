// Job Board Testing Guide & Setup

/**
 * TESTING THE JOB BOARD FEATURE
 * 
 * Flow:
 * 1. Register a user (anyone can register)
 * 2. Verify their email
 * 3. Login to get JWT token
 * 4. Update their account type to "Creator"
 * 5. Create a job posting (requires authentication + Creator status)
 * 6. View, update, delete jobs
 */

// ============================================
// STEP 1: REGISTER A NEW USER
// ============================================
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

Response:
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "creator@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isVerified": false,
    "createdAt": "2025-11-16T10:00:00.000Z"
  }
}

// ============================================
// STEP 2: VERIFY EMAIL
// ============================================
// Check your email for the verification link or use the token sent
GET /api/auth/verify/:verificationToken

Response:
{
  "message": "Email verification successful",
  "user": {
    "id": 1,
    "email": "creator@example.com",
    "isVerified": true,
    ...
  }
}

// ============================================
// STEP 3: LOGIN TO GET JWT TOKEN
// ============================================
POST /api/auth/login
Content-Type: application/json

{
  "email": "creator@example.com",
  "password": "SecurePassword123!"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "creator@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isVerified": true,
    ...
  }
}

// SAVE THIS TOKEN FOR ALL AUTHENTICATED REQUESTS
// Authorization: Bearer {token}

// ============================================
// STEP 4: UPDATE USER ACCOUNT TYPE TO CREATOR
// ============================================
// Only Creators can post jobs. Update your account type to Creator:

PUT /api/auth/account-type
Authorization: Bearer {token}
Content-Type: application/json

{
  "accountType": "Creator"
}

Response:
{
  "message": "Account type updated successfully",
  "user": {
    "id": 1,
    "email": "creator@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "accountType": "Creator",
    "isVerified": true,
    "createdAt": "2025-11-16T10:00:00.000Z"
  }
}

// ============================================
// STEP 5: CREATE A JOB POSTING (AUTHENTICATED)
// ============================================
POST /api/jobs
Authorization: Bearer {token}
Content-Type: application/json

{
  "values": {
    "title": "Social Media Content Creator",
    "description": "Looking for an experienced content creator to produce TikTok videos",
    "gender": "Any",
    "availability": "Full-time",
    "location": "Remote",
    "category": "Content Creation",
    "age": "18+",
    "experience": "2-3 years",
    "priority": "High",
    "visibility": "Public",
    "payment": "5000-7000",
    "paymentdesc": "per month",
    "link": "https://example.com/job-details",
    "years": "2-3"
  },
  "goals": [
    "Produce 10 videos per week",
    "Increase follower base by 50%",
    "Reach 1M views monthly"
  ],
  "skills": [
    "Video Editing",
    "Content Strategy",
    "Social Media Marketing",
    "Creativity"
  ],
  "contents": [
    "TikTok",
    "Instagram Reels",
    "YouTube Shorts"
  ],
  "platforms": [
    "TikTok",
    "Instagram",
    "YouTube"
  ]
}

Response:
{
  "message": "Job created successfully",
  "data": {
    "id": 1,
    "owner": 1,
    "owner_email": "creator@example.com",
    "values": { ... },
    "goals": [ ... ],
    "skills": [ ... ],
    "contents": [ ... ],
    "platforms": [ ... ],
    "proposals": [],
    "createdAt": "2025-11-16T10:00:00.000Z",
    "updatedAt": "2025-11-16T10:00:00.000Z"
  }
}

// ============================================
// STEP 6: GET ALL JOBS (PUBLIC - NO AUTH NEEDED)
// ============================================
GET /api/jobs

Response:
{
  "message": "Jobs retrieved successfully",
  "data": [
    {
      "id": 1,
      "owner": 1,
      "owner_email": "creator@example.com",
      "values": { ... },
      ...
    }
  ]
}

// ============================================
// STEP 7: GET A SPECIFIC JOB (PUBLIC - NO AUTH NEEDED)
// ============================================
GET /api/jobs/:id

Response:
{
  "message": "Job retrieved successfully",
  "data": {
    "id": 1,
    "owner": 1,
    "owner_email": "creator@example.com",
    "values": { ... },
    ...
  }
}

// ============================================
// STEP 8: UPDATE YOUR JOB (AUTHENTICATED - OWNER ONLY)
// ============================================
PUT /api/jobs/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "values": {
    "title": "Updated Title",
    "description": "Updated description",
    ...
  }
}

Response:
{
  "message": "Job updated successfully",
  "data": {
    "id": 1,
    "owner": 1,
    ...
  }
}

// ============================================
// STEP 9: DELETE YOUR JOB (AUTHENTICATED - OWNER ONLY)
// ============================================
DELETE /api/jobs/:id
Authorization: Bearer {token}

Response:
{
  "message": "Job deleted successfully"
}

// ============================================
// STEP 10: GET YOUR JOBS (AUTHENTICATED)
// ============================================
GET /api/jobs/my-jobs
Authorization: Bearer {token}

Response:
{
  "message": "Your jobs retrieved successfully",
  "data": [
    {
      "id": 1,
      "owner": 1,
      "owner_email": "creator@example.com",
      ...
    }
  ]
}

// ============================================
// IMPORTANT NOTES
// ============================================

/**
 * AUTHENTICATION REQUIREMENTS:
 * - POST /api/jobs ............... ✅ REQUIRES AUTH
 * - GET /api/jobs ................ ❌ NO AUTH NEEDED
 * - GET /api/jobs/:id ............ ❌ NO AUTH NEEDED
 * - GET /api/jobs/my-jobs ........ ✅ REQUIRES AUTH
 * - PUT /api/jobs/:id ............ ✅ REQUIRES AUTH (must be owner)
 * - DELETE /api/jobs/:id ......... ✅ REQUIRES AUTH (must be owner)
 * - POST /api/jobs/:id/proposals . ✅ REQUIRES AUTH
 * - GET /api/jobs/:id/proposals .. ✅ REQUIRES AUTH (only for owner)
 * 
 * USER TYPES:
 * - "Individual" - regular user
 * - "Business" - business account
 * - "Creator" - content creator (can post jobs)
 * - "None" - default, no specific role
 * 
 * ACCOUNT TYPE FLOW:
 * 1. User registers -> accountType = "None"
 * 2. User fills out Creator profile -> accountType = "Creator"
 * 3. Creator can now post jobs
 * 
 * HEADERS REQUIRED FOR AUTHENTICATED REQUESTS:
 * Authorization: Bearer {jwt_token}
 * 
 * TOKEN EXPIRY: 24 hours
 * 
 * PROPOSAL WORKFLOW:
 * - Freelancer/vendor submits proposal for a job
 * - Proposal stored in job.proposals array
 * - Job owner can view proposals via GET /api/jobs/:id/proposals
 */
