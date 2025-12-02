// COMPLETE TESTING WORKFLOW - JOB BOARD FEATURE

/**
 * =========================================
 * 1. REGISTER AS A NEW USER
 * =========================================
 */

POST http://localhost:5000/api/auth/register
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

// Response will include:
// - token: save this for later use
// - user with accountType: "None" (default)
// - isVerified: false (need to verify email first)

/**
 * =========================================
 * 2. VERIFY YOUR EMAIL
 * =========================================
 * Check your email inbox for verification link OR
 * Use the token from registration response:
 */

GET http://localhost:5000/api/auth/verify/{verificationToken}

// After verification, isVerified will be true

/**
 * =========================================
 * 3. LOGIN TO GET JWT TOKEN
 * =========================================
 * Only verified users can login
 */

POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "creator@example.com",
  "password": "SecurePassword123!"
}

// Response will include:
// - token: this is your JWT (valid for 24 hours)
// Store this token in your client for authenticated requests

// Example header for authenticated requests:
// Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

/**
 * =========================================
 * 4. UPDATE ACCOUNT TYPE TO CREATOR
 * =========================================
 * CRITICAL: You must be a Creator to post jobs
 */

PUT http://localhost:5000/api/auth/account-type
Authorization: Bearer {your_token_from_login}
Content-Type: application/json

{
  "accountType": "Creator"
}

// Valid account types:
// - "Individual" (regular user)
// - "Business" (business account)
// - "Creator" (content creator - can post jobs)
// - "None" (default, no specific role)

/**
 * =========================================
 * 5. CREATE A JOB POSTING
 * =========================================
 * Only authenticated Creators can create jobs
 */

POST http://localhost:5000/api/jobs
Authorization: Bearer {your_token_from_login}
Content-Type: application/json

{
  "values": {
    "title": "Social Media Content Creator Needed",
    "description": "Looking for an experienced TikTok content creator to produce viral short-form videos",
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
    "Achieve 1M monthly views"
  ],
  "skills": [
    "Video Editing",
    "Content Strategy",
    "Social Media Marketing",
    "Creativity",
    "TikTok Algorithm Knowledge"
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

// Expected response (201 Created):
// {
//   "message": "Job created successfully",
//   "data": {
//     "id": 1,
//     "owner": 1,
//     "owner_email": "creator@example.com",
//     "values": { ... },
//     "goals": [ ... ],
//     "skills": [ ... ],
//     "contents": [ ... ],
//     "platforms": [ ... ],
//     "proposals": [],
//     "createdAt": "2025-11-16T10:30:00.000Z",
//     "updatedAt": "2025-11-16T10:30:00.000Z"
//   }
// }

/**
 * =========================================
 * 6. GET ALL JOBS (PUBLIC - NO AUTH NEEDED)
 * =========================================
 */

GET http://localhost:5000/api/jobs
Content-Type: application/json

// No authentication header needed
// Returns all publicly visible jobs

/**
 * =========================================
 * 7. GET A SPECIFIC JOB (PUBLIC - NO AUTH NEEDED)
 * =========================================
 */

GET http://localhost:5000/api/jobs/1
Content-Type: application/json

// Returns job details for job with id=1

/**
 * =========================================
 * 8. GET YOUR JOBS (AUTHENTICATED)
 * =========================================
 */

GET http://localhost:5000/api/jobs/my-jobs
Authorization: Bearer {your_token}
Content-Type: application/json

// Returns only jobs you created

/**
 * =========================================
 * 9. UPDATE YOUR JOB (AUTHENTICATED - OWNER ONLY)
 * =========================================
 */

PUT http://localhost:5000/api/jobs/1
Authorization: Bearer {your_token}
Content-Type: application/json

{
  "values": {
    "title": "Updated Title",
    "description": "Updated description with new requirements",
    "payment": "6000-8000"
  }
}

// Only the job owner can update their jobs

/**
 * =========================================
 * 10. DELETE YOUR JOB (AUTHENTICATED - OWNER ONLY)
 * =========================================
 */

DELETE http://localhost:5000/api/jobs/1
Authorization: Bearer {your_token}

// Only the job owner can delete their jobs

/**
 * =========================================
 * AUTHENTICATION SUMMARY
 * =========================================
 * 
 * ENDPOINTS & AUTH REQUIREMENTS:
 * 
 * POST /api/jobs .................... ✅ REQUIRES AUTH (Creator)
 * GET /api/jobs ..................... ❌ PUBLIC (no auth)
 * GET /api/jobs/:id ................ ❌ PUBLIC (no auth)
 * GET /api/jobs/my-jobs ............ ✅ REQUIRES AUTH
 * PUT /api/jobs/:id ................ ✅ REQUIRES AUTH (owner only)
 * DELETE /api/jobs/:id ............. ✅ REQUIRES AUTH (owner only)
 * POST /api/jobs/:id/proposals ..... ✅ REQUIRES AUTH
 * GET /api/jobs/:id/proposals ...... ✅ REQUIRES AUTH (owner only)
 * 
 * =========================================
 * KEY RULES
 * =========================================
 * 
 * 1. CREATOR ACCOUNT REQUIRED
 *    - Only users with accountType = "Creator" can post jobs
 *    - Use PUT /api/auth/account-type to update
 * 
 * 2. AUTHENTICATION TOKEN
 *    - Always include header: Authorization: Bearer {token}
 *    - Token obtained from login, valid for 24 hours
 *    - If token expires, login again
 * 
 * 3. OWNERSHIP REQUIREMENT
 *    - You can only update/delete YOUR OWN jobs
 *    - System validates owner on update/delete
 * 
 * 4. EMAIL VERIFICATION
 *    - Must verify email before login
 *    - Check email for verification link
 *    - Can resend verification: POST /api/auth/resend-verification
 * 
 * =========================================
 * TESTING WITH POSTMAN/CURL
 * =========================================
 * 
 * SAVE TOKEN AFTER LOGIN:
 * Store the token in an environment variable or collection variable
 * 
 * POSTMAN SETUP:
 * 1. Create collection "Job Board API"
 * 2. Create folder "Authentication"
 * 3. Create folder "Jobs"
 * 4. In collection settings, create variable: token (type: string)
 * 5. After login response, set: {{token}} = response body token
 * 6. Use {{token}} in Authorization headers
 * 
 * CURL EXAMPLE:
 * curl -X POST http://localhost:5000/api/jobs \
 *   -H "Authorization: Bearer {token}" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "values": {...},
 *     "goals": [...],
 *     "skills": [...],
 *     "contents": [...],
 *     "platforms": [...]
 *   }'
 * 
 * =========================================
 */
