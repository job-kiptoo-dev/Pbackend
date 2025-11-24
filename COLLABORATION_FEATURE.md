# Collaboration Feature Documentation

## Overview

The Collaboration feature enables users to invite and manage collaborators on campaigns and business projects. It provides a complete invitation system with role-based access control, expiration handling, and collaboration lifecycle management.

## Architecture

### Type Definitions (`src/types/collaboration.types.ts`)

Key types and enumerations:

- **`CollaborationInvite`** - Basic invitation interface with email and note
- **`ExtendedCollaborationInvite`** - Extended invitation with full details (inviter, role, type, etc.)
- **`CollaborationMember`** - Represents a member in a collaboration with their role and status
- **`CollaborationData`** - API request/response interface for collaboration operations
- **`CollaborationRole`** - Enum: Owner, Admin, Lead, Contributor, Viewer
- **`CollaborationStatus`** - Enum: Pending, Accepted, Rejected, Active, Inactive
- **`CollaborationType`** - Enum: Campaign, Business, Project, Referral

### Database Entity (`src/db/entity/Collaboration.entity.ts`)

The `CollaborationEntity` stores collaboration records with:

- **Relations**: Links to User (inviter/invitee), Campaign, and Business
- **Fields**:
  - `collaborationType` - Type of collaboration (Campaign, Business, etc.)
  - `role` - Collaborator's role (Owner, Admin, Lead, Contributor, Viewer)
  - `status` - Invitation status (Pending, Accepted, Rejected, Active, Inactive)
  - `invitationToken` - Unique token for invitation verification
  - `expiresAt` - Invitation expiration date
  - `acceptedAt` - When the invitation was accepted
  - `message` - Optional message from inviter

### Service Layer (`src/services/collaboration.service.ts`)

Comprehensive business logic for collaboration management:

#### Core Methods

- **`createCollaborationInvite(data)`** - Create new collaboration invitation
- **`acceptCollaborationInvite(invitationId, userId)`** - Accept pending invitation
- **`rejectCollaborationInvite(invitationId, userId)`** - Reject invitation
- **`getCollaborationInvites(userId)`** - Get all invitations for a user
- **`getPendingInvitations(userId)`** - Get pending invitations
- **`verifyInvitationToken(token)`** - Verify invitation by token

#### Collaborator Management

- **`getCampaignCollaborators(campaignId)`** - Get all active collaborators for a campaign
- **`getBusinessCollaborators(businessId)`** - Get all active collaborators for a business
- **`updateCollaboratorRole(collaborationId, newRole, requesterId)`** - Update a collaborator's role
- **`removeCollaborator(collaborationId, requesterId)`** - Remove a collaborator

#### Verification Methods

- **`isUserCampaignCollaborator(userId, campaignId)`** - Check if user is campaign collaborator
- **`isUserBusinessCollaborator(userId, businessId)`** - Check if user is business collaborator

### Controller (`src/controllers/collaboration.controller.ts`)

HTTP request handlers for all collaboration operations:

- `createInvitation()` - POST /api/collaborations/invite
- `acceptInvitation()` - POST /api/collaborations/accept
- `rejectInvitation()` - POST /api/collaborations/reject
- `getMyInvitations()` - GET /api/collaborations/my-invitations
- `getPendingInvitations()` - GET /api/collaborations/pending
- `getCampaignCollaborators()` - GET /api/collaborations/campaign/:campaignId
- `getBusinessCollaborators()` - GET /api/collaborations/business/:businessId
- `updateCollaboratorRole()` - PUT /api/collaborations/:collaborationId/role
- `removeCollaborator()` - DELETE /api/collaborations/:collaborationId
- `verifyInvitationToken()` - GET /api/collaborations/verify/:token

### Routes (`src/routes/collaboration.routes.ts`)

RESTful API endpoints for collaboration management. All endpoints are documented with Swagger JSDoc comments.

## API Endpoints

### Authentication Required Endpoints

All endpoints requiring authentication use the `authenticate` middleware and expect:
```
Authorization: Bearer <JWT_TOKEN>
```

### Endpoints

#### 1. Create Collaboration Invitation
```
POST /api/collaborations/invite
```

**Request Body:**
```json
{
  "collaborationType": "Campaign",
  "entityId": 1,
  "inviteeEmail": "user@example.com",
  "role": "Contributor",
  "message": "Join our campaign team!",
  "expiresIn": 168
}
```

**Response:**
```json
{
  "message": "Collaboration invitation created successfully",
  "data": {
    "id": 1,
    "collaborationType": "Campaign",
    "role": "Contributor",
    "status": "Pending",
    "invitationToken": "uuid-token",
    "createdAt": "2025-11-14T10:00:00Z"
  }
}
```

#### 2. Accept Collaboration Invitation
```
POST /api/collaborations/accept
```

**Request Body:**
```json
{
  "invitationId": 1
}
```

#### 3. Reject Collaboration Invitation
```
POST /api/collaborations/reject
```

**Request Body:**
```json
{
  "invitationId": 1
}
```

#### 4. Get My Invitations
```
GET /api/collaborations/my-invitations
```

**Response:**
```json
{
  "message": "Invitations retrieved successfully",
  "data": [
    {
      "id": 1,
      "collaborationType": "Campaign",
      "status": "Pending",
      "role": "Contributor",
      "createdAt": "2025-11-14T10:00:00Z"
    }
  ]
}
```

#### 5. Get Pending Invitations
```
GET /api/collaborations/pending
```

#### 6. Get Campaign Collaborators
```
GET /api/collaborations/campaign/:campaignId
```

#### 7. Get Business Collaborators
```
GET /api/collaborations/business/:businessId
```

#### 8. Update Collaborator Role
```
PUT /api/collaborations/:collaborationId/role
```

**Request Body:**
```json
{
  "role": "Lead"
}
```

#### 9. Remove Collaborator
```
DELETE /api/collaborations/:collaborationId
```

#### 10. Verify Invitation Token
```
GET /api/collaborations/verify/:token
```

## Usage Examples

### Example 1: Inviting a Collaborator to a Campaign

```typescript
// Frontend/API Client
const response = await fetch('http://localhost:5000/api/collaborations/invite', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
  },
  body: JSON.stringify({
    collaborationType: 'Campaign',
    entityId: 5,
    inviteeEmail: 'john@example.com',
    role: 'Lead',
    message: 'I would like you to lead this campaign',
    expiresIn: 168, // 7 days
  }),
});
```

### Example 2: Accepting an Invitation

```typescript
const response = await fetch('http://localhost:5000/api/collaborations/accept', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
  },
  body: JSON.stringify({
    invitationId: 1,
  }),
});
```

### Example 3: Getting Campaign Collaborators

```typescript
const response = await fetch(
  'http://localhost:5000/api/collaborations/campaign/5',
  {
    headers: {
      'Authorization': 'Bearer ' + token,
    },
  }
);

const { data: collaborators } = await response.json();
collaborators.forEach(collab => {
  console.log(`${collab.invitee.firstName} - Role: ${collab.role}`);
});
```

## Integration with Campaign System

The collaboration feature integrates seamlessly with existing campaigns:

1. **Campaign Access Control** - Check if user is authorized to access campaign:
   ```typescript
   const isCollaborator = await collaborationService.isUserCampaignCollaborator(userId, campaignId);
   ```

2. **Team Management** - Collaborators are distinct from campaign teams:
   - **Teams** (`CampaignTeam`) - Managed within a campaign for internal organization
   - **Collaborators** (`CollaborationEntity`) - External team members with specific roles

3. **Cascade Delete** - Removing a campaign automatically removes related collaborations

## Security Features

1. **Role-Based Access Control** - 5-tier role system (Owner, Admin, Lead, Contributor, Viewer)
2. **Invitation Tokens** - Unique UUID tokens for secure invitation verification
3. **Expiration Handling** - Invitations expire automatically (default 7 days)
4. **Authorization Checks** - Only inviter can modify or remove collaborators
5. **User Verification** - Invitations tied to verified user emails

## Error Handling

All endpoints return appropriate HTTP status codes:

- `400` - Bad Request (missing/invalid fields)
- `401` - Unauthorized (authentication required)
- `404` - Not Found (invitation/collaboration not found)
- `500` - Internal Server Error

Error responses include descriptive messages:

```json
{
  "error": "Unauthorized",
  "message": "Only the inviter can modify this collaboration"
}
```

## Database Schema

The `collaborations` table includes:

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary key |
| collaborationType | ENUM | Campaign, Business, Project, Referral |
| campaign_id | INTEGER | Foreign key to campaigns table |
| business_id | INTEGER | Foreign key to businesses table |
| inviter_id | INTEGER | User who created the invitation |
| invitee_id | INTEGER | User being invited (nullable) |
| inviteeEmail | VARCHAR | Email of invitee |
| role | ENUM | Owner, Admin, Lead, Contributor, Viewer |
| status | ENUM | Pending, Accepted, Rejected, Active, Inactive |
| message | TEXT | Optional message |
| expiresAt | TIMESTAMP | Invitation expiration |
| acceptedAt | TIMESTAMP | When invitation was accepted |
| invitationToken | VARCHAR | Unique token for verification |
| createdAt | TIMESTAMP | Record creation time |
| updatedAt | TIMESTAMP | Last update time |

## Future Enhancements

1. **Bulk Invitations** - Invite multiple users at once
2. **Email Notifications** - Send email when invited
3. **Collaboration Analytics** - Track collaboration metrics
4. **Permission Hierarchy** - More granular permission system
5. **Collaboration Groups** - Group collaborators with shared permissions
6. **Activity Logs** - Track all collaboration actions
7. **Collaboration Reviews** - Rate and review collaborators
