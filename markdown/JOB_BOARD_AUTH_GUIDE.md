// Job Board Security & Authentication Pattern

# Job Board API - Authentication Requirements

## Overview
The Job Board API follows the security pattern of your backend where:
- **GET endpoints** = Public (no authentication required)
- **POST, PUT, DELETE endpoints** = Protected (authentication required via JWT Bearer token)

## Authentication Pattern

### Protected Endpoints (Require Authentication)
All write operations (POST, PUT, DELETE) must include:
```
Authorization: Bearer <JWT_TOKEN>
```

#### POST Routes (Create):
- `POST /api/jobs` - Create new job posting
- `POST /api/jobs/{id}/proposals` - Create new job proposal

#### PUT Routes (Update):
- `PUT /api/jobs/{id}` - Update job details
- `PUT /api/jobs/{id}/proposals/{proposalId}` - Update proposal status

#### DELETE Routes (Delete):
- `DELETE /api/jobs/{id}` - Delete job posting
- `DELETE /api/jobs/{id}/proposals/{proposalId}` - Delete proposal

### Public Endpoints (No Authentication)
All read operations (GET) are publicly accessible:
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/{id}` - Get specific job
- `GET /api/jobs/search?query=...` - Search jobs
- `GET /api/jobs/category/{category}` - Get jobs by category
- `GET /api/jobs/owner/{ownerId}` - Get jobs by owner
- `GET /api/jobs/{id}/proposals` - Get job proposals

## Implementation Details

### Middleware: authenticate
Located at: `src/middleware/auth.middleware.ts`

```typescript
import { authenticate } from "../middleware/auth.middleware";
```

Applied to all write operations:
```typescript
router.post("/", authenticate, jobController.createJob);
router.put("/:id", authenticate, jobController.updateJob);
router.delete("/:id", authenticate, jobController.deleteJob);
router.post("/:id/proposals", authenticate, jobController.createProposal);
router.put("/:id/proposals/:proposalId", authenticate, jobController.updateProposalStatus);
router.delete("/:id/proposals/:proposalId", authenticate, jobController.deleteProposal);
```

## Flow Example

### Creating a Job (Requires Auth)
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -d '{
    "owner": "1",
    "values": {
      "title": "Senior Developer",
      "description": "Looking for experienced developer",
      "location": "New York",
      "category": "Development",
      "payment": "$80k-$120k"
    },
    "goals": ["Build scalable API"],
    "skills": ["TypeScript", "Node.js"],
    "contents": ["Technical Documentation"],
    "platforms": ["GitHub", "LinkedIn"]
  }'
```

Response (201 Created):
```json
{
  "message": "Job created successfully",
  "job": {
    "insertedId": "1"
  },
  "data": {
    "id": 1,
    "title": "Senior Developer",
    "description": "Looking for experienced developer",
    ...
  }
}
```

### Searching Jobs (No Auth Required)
```bash
curl -X GET "http://localhost:5000/api/jobs/search?query=developer"
```

Response (200 OK):
```json
{
  "message": "Search completed successfully",
  "data": [
    {
      "id": 1,
      "title": "Senior Developer",
      ...
    }
  ]
}
```

## Error Responses

### 401 Unauthorized (Missing/Invalid Token)
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### 400 Bad Request (Invalid Data)
```json
{
  "error": "Job creation failed",
  "message": "owner, values.title, and values.description are required"
}
```

### 404 Not Found
```json
{
  "error": "Job not found",
  "message": "Job with ID 999 not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Job creation failed",
  "message": "Internal server error"
}
```

## JWT Token Management

Tokens are issued during authentication:
- Check: `src/controllers/auth.controller.ts` for token generation
- Service: `src/services/email.service.ts` or auth-related services
- Utility: `src/utils/token.utils.ts` for token operations

## Security Best Practices

1. **Always include Bearer token for write operations**
   - Token must be valid and not expired
   - Included in `Authorization` header

2. **Data Validation**
   - Required fields checked before processing
   - Invalid IDs return 400 Bad Request

3. **Resource Authorization** (Optional Enhancement)
   - Can add ownership checks to verify user owns resource
   - Example: Only job owner can update/delete their job

4. **Rate Limiting**
   - Check: `src/middleware/rateLimit.middleware.ts`
   - Can be applied to protect API from abuse

## Environment Setup

Ensure these are set in your `.env`:
```
PORT=5000
JWT_SECRET=your-secret-key
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=paza
NODE_ENV=development
```

## Testing Authentication

### With Valid Token:
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Authorization: Bearer VALID_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...job data...}'
# Response: 201 Created
```

### Without Token:
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{...job data...}'
# Response: 401 Unauthorized
```

### With Invalid Token:
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Authorization: Bearer INVALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...job data...}'
# Response: 401 Unauthorized
```

---

**Summary**: All Job Board API write operations (POST, PUT, DELETE) require JWT authentication. Read operations (GET) are public. This follows your backend's standard security pattern.
