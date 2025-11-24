// QUICK REFERENCE - JOB BOARD TESTING

/**
 * ===== STEP-BY-STEP TESTING =====
 * 
 * 1️⃣ REGISTER
 *    POST /api/auth/register
 *    Body: {email, password, firstname, lastname, birthday, gender, phone, city}
 *    → Get token (save it)
 * 
 * 2️⃣ VERIFY EMAIL
 *    GET /api/auth/verify/{verificationToken}
 *    → Check email for token, or use response token
 * 
 * 3️⃣ LOGIN
 *    POST /api/auth/login
 *    Body: {email, password}
 *    → Get NEW token (use this for authenticated requests)
 * 
 * 4️⃣ BECOME A CREATOR
 *    PUT /api/auth/account-type
 *    Header: Authorization: Bearer {token}
 *    Body: {accountType: "Creator"}
 *    → Now you can post jobs
 * 
 * 5️⃣ CREATE A JOB
 *    POST /api/jobs
 *    Header: Authorization: Bearer {token}
 *    Body: {values, goals, skills, contents, platforms}
 *    → Job created successfully
 * 
 * 6️⃣ VIEW YOUR JOBS
 *    GET /api/jobs/my-jobs
 *    Header: Authorization: Bearer {token}
 *    → Lists all your jobs
 * 
 * 7️⃣ UPDATE A JOB
 *    PUT /api/jobs/{id}
 *    Header: Authorization: Bearer {token}
 *    Body: {values (partial update), goals, skills, contents, platforms}
 *    → Job updated
 * 
 * 8️⃣ DELETE A JOB
 *    DELETE /api/jobs/{id}
 *    Header: Authorization: Bearer {token}
 *    → Job deleted
 * 
 * 9️⃣ ANYONE CAN VIEW JOBS
 *    GET /api/jobs
 *    → All public jobs
 * 
 *    GET /api/jobs/{id}
 *    → Specific job details
 * 
 * ===== KEY POINTS =====
 * 
 * ✅ POST requests need: Authorization header + Creator account type
 * ✅ PUT/DELETE requests need: Authorization header + You must be owner
 * ✅ GET requests: Most are public, "my-jobs" needs auth
 * ✅ Token format: "Bearer eyJhbGciOiJI..."
 * ✅ Token expires in: 24 hours
 * ✅ Email must be verified before login
 * ✅ Account type must be "Creator" to post jobs
 * 
 * ===== COMMON ERRORS =====
 * 
 * ❌ 401 Unauthorized
 *    → Token missing or invalid/expired
 *    → Solution: Login again to get fresh token
 * 
 * ❌ 403 Forbidden
 *    → You're not the owner of this resource
 *    → Solution: You can only modify your own jobs
 * 
 * ❌ 400 Bad Request
 *    → Account not Creator type
 *    → Solution: Use PUT /api/auth/account-type first
 * 
 * ❌ Email not verified
 *    → Cannot login without verified email
 *    → Solution: Check email for verification link
 * 
 * ===== ENVIRONMENT VARIABLES =====
 * 
 * If testing locally, make sure your .env has:
 * - PORT=5000
 * - JWT_SECRET=your_secret_key
 * - DB_HOST=localhost
 * - DB_PORT=5432
 * - DB_USERNAME=your_username
 * - DB_PASSWORD=your_password
 * - DB_DATABASE=your_database
 * 
 * ===== RUN SERVER =====
 * 
 * npm run dev
 * 
 * Server will start on port 5000
 * Swagger docs at: http://localhost:5000/api-docs
 * 
 */
