# Collaboration System - Integration Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        API Client                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Express Routes                           │
│            (src/routes/collaboration.routes.ts)             │
│                                                              │
│  POST /invite        GET /campaign/:id    PUT /:id/role    │
│  POST /accept        GET /business/:id    DELETE /:id      │
│  POST /reject        GET /my-invitations  GET /verify/:t   │
│  GET  /pending                                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Controller Layer                          │
│          (src/controllers/collaboration.controller.ts)      │
│                                                              │
│  Request validation  │  Response formatting               │
│  Auth checking       │  Error handling                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                           │
│          (src/services/collaboration.service.ts)           │
│                                                              │
│  ├─ createCollaborationInvite()                           │
│  ├─ acceptCollaborationInvite()                           │
│  ├─ getCampaignCollaborators()                            │
│  ├─ updateCollaboratorRole()                              │
│  ├─ verifyInvitationToken()                               │
│  └─ ... (13+ methods)                                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Entity Layer                             │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                │
│  │ Collaboration   │  │ User            │                │
│  │ Entity          │─→│ (inviter)       │                │
│  └─────────────────┘  └─────────────────┘                │
│           │                                               │
│           ├─────────────┬──────────────┐                 │
│           │             │              │                 │
│           ▼             ▼              ▼                 │
│      Campaign      Business          User               │
│      (optional)    (optional)        (invitee)          │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                         │
│                                                              │
│  Table: collaborations                                     │
│  ├─ id (PK)                                              │
│  ├─ collaborationType                                    │
│  ├─ campaign_id (FK)                                    │
│  ├─ business_id (FK)                                    │
│  ├─ inviter_id (FK)                                     │
│  ├─ invitee_id (FK, nullable)                           │
│  ├─ role, status, message, token                        │
│  └─ timestamps                                          │
└─────────────────────────────────────────────────────────────┘
```

## Request Flow Example

### Scenario: Creating a Campaign Collaboration

```
1. USER ACTION
   └─ User clicks "Invite Collaborator" button
      └─ Frontend sends POST /api/collaborations/invite

2. ROUTE LAYER
   └─ Route handler receives request
      └─ Applies authenticate middleware
         └─ Extracts JWT token, validates, sets req.user

3. CONTROLLER LAYER
   └─ createInvitation() method called
      └─ Validates request body:
         ├─ collaborationType required ✓
         ├─ entityId required ✓
         ├─ role required ✓
         ├─ inviteeEmail or inviteeId required ✓
      └─ Calls collaborationService.createCollaborationInvite()

4. SERVICE LAYER
   └─ Validates inviter exists in database
   └─ Validates campaign (entityId) exists
   └─ Generates invitation token (UUID)
   └─ Calculates expiration date
   └─ Creates CollaborationEntity record
   └─ Saves to database
   └─ Returns collaboration object

5. CONTROLLER RESPONSE
   └─ Returns 201 Created
      └─ Body includes:
         ├─ message: "Collaboration invitation created successfully"
         ├─ data: { collaboration object }

6. DATABASE
   └─ New row inserted in collaborations table
      ├─ status: "Pending"
      ├─ invitationToken: "uuid-123-456"
      ├─ expiresAt: "2025-11-21T10:00:00Z"
      ├─ Other fields populated
```

## Data Flow Diagram

```
Frontend Request
       │
       ▼
┌─────────────────────────────────────────┐
│ Authentication Middleware               │
│ - Verify JWT token                      │
│ - Set req.user from token               │
│ - Reject if invalid                     │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Route Handler                           │
│ - Extract path params                   │
│ - Parse body                            │
│ - Call controller method                │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Controller Method                       │
│ - Extract req.body, req.params, req.user│
│ - Validate inputs                       │
│ - Call service method                   │
│ - Format response                       │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Service Method                          │
│ - Fetch entities from database          │
│ - Apply business logic                  │
│ - Validate relationships                │
│ - Perform CRUD operations               │
│ - Return result or throw error          │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ TypeORM Entity Operations               │
│ - Query builder                         │
│ - Relationships loading                 │
│ - Save/Update/Delete                    │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ PostgreSQL Database                     │
│ - Execute SQL queries                   │
│ - Return data                           │
└─────────────────────────────────────────┘
       │
       ▼
Back through layers to HTTP Response
```

## Integration Points

### 1. Authentication System
```typescript
// Uses existing auth middleware
import { authenticate } from "../middleware/auth.middleware";

// Protects routes
router.post("/invite", authenticate, collaborationController.createInvitation);

// In controller, access user from request
const userId = (req as any).user?.id;
```

### 2. User Entity
```typescript
// Collaboration links to User for inviter and invitee
@ManyToOne(() => User, { nullable: false })
inviter: User;

@ManyToOne(() => User, { nullable: true })
invitee: User | null;
```

### 3. Campaign Entity
```typescript
// Collaboration links to Campaign
@ManyToOne(() => Campaign, { nullable: true, onDelete: "CASCADE" })
campaign: Campaign | null;

// Service validates campaign exists
const campaign = await Campaign.findOne({ where: { id: data.entityId } });
```

### 4. Business Entity
```typescript
// Collaboration links to Business
@ManyToOne(() => Business, { nullable: true, onDelete: "CASCADE" })
business: Business | null;

// Service validates business exists
const business = await Business.findOne({ where: { id: data.entityId } });
```

### 5. Database
```typescript
// Added to AppDataSource
entities: [
  // ... other entities
  CollaborationEntity,
]

// TypeORM auto-creates table and migrations via synchronize: true
```

## Type Safety

### Type Flow
```
User Input (JSON)
       │
       ▼
Request Body Parsing
       │
       ▼
Interface/Type Validation (partial TypeScript)
       │
       ▼
Service Method Call with Typed Parameters
       │
       ▼
Database Operations (TypeORM types)
       │
       ▼
Type-Safe Response (TypeScript return types)
```

### Key Types
```typescript
// From collaboration.types.ts
export enum CollaborationType {
  CAMPAIGN = "Campaign",
  BUSINESS = "Business",
  PROJECT = "Project",
  REFERRAL = "Referral",
}

export enum CollaborationRole {
  OWNER = "Owner",
  ADMIN = "Admin",
  LEAD = "Lead",
  CONTRIBUTOR = "Contributor",
  VIEWER = "Viewer",
}

export enum CollaborationStatus {
  PENDING = "Pending",
  ACCEPTED = "Accepted",
  REJECTED = "Rejected",
  ACTIVE = "Active",
  INACTIVE = "Inactive",
}
```

## Middleware Chain

```
Request
   │
   ├─ helmet() ──────────── Security headers
   ├─ cors() ──────────── Cross-origin handling
   ├─ express.json() ──────── Parse JSON
   │
   ├─ For /api/collaborations/invite (POST):
   │   └─ authenticate ────── Verify JWT
   │      └─ collaborationController.createInvitation()
   │
   └─ For /api/collaborations/pending (GET):
      └─ authenticate ────── Verify JWT
         └─ collaborationController.getPendingInvitations()

Response back through middleware
```

## Error Handling Flow

```
Any Method Throws Error
       │
       ▼
Try-Catch in Controller
       │
       ├─ Error message logged
       ├─ HTTP status determined
       ├─ Error response formatted
       │
       ▼
Response with:
  {
    "error": "Error Category",
    "message": "Descriptive message"
  }
```

## State Transitions

```
Collaboration Lifecycle:

CREATE (Pending)
   │
   ├─→ User accepts ──────→ ACCEPTED
   │      │
   │      └─→ ACTIVE (if configured)
   │
   └─→ User rejects ──────→ REJECTED


Or Manual State Changes:

ACCEPTED ←→ ACTIVE ←→ INACTIVE

REMOVE (Delete record)
```

## Performance Considerations

### Queries
```typescript
// Optimized with relations
await CollaborationEntity.find({
  where: { campaign: { id: campaignId } },
  relations: ["inviter", "invitee"], // Preload relationships
  order: { createdAt: "DESC" },
});
```

### Indexes (Consider Adding)
```sql
CREATE INDEX idx_collab_campaign ON collaborations(campaign_id);
CREATE INDEX idx_collab_business ON collaborations(business_id);
CREATE INDEX idx_collab_invitee ON collaborations(invitee_id);
CREATE INDEX idx_collab_status ON collaborations(status);
CREATE INDEX idx_collab_token ON collaborations(invitationToken);
```

## Security Layers

```
1. HTTPS/TLS ────────── Transport layer encryption
2. CORS ────────── Origin validation
3. JWT Authentication ────────── User identity verification
4. Authorization Checks ────────── Only inviter can modify
5. Rate Limiting ────────── (Future) Prevent spam
6. Input Validation ────────── Prevent injection attacks
7. Invitation Tokens ────────── Secure invitation sharing
8. Expiration Handling ────────── Time-limited access
```

## Deployment Checklist

- [ ] Database migration (auto-sync enabled)
- [ ] Environment variables configured
- [ ] JWT secret configured
- [ ] CORS origins updated
- [ ] Email service configured (optional)
- [ ] Rate limiting configured (optional)
- [ ] Logging configured
- [ ] Monitoring set up
- [ ] Backup strategy in place
