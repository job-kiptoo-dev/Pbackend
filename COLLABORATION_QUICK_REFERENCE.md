# Collaboration Feature - Quick Reference

## Overview
Complete collaboration system for inviting and managing team members on campaigns and businesses.

## Core Concepts

### Roles
- **Owner** - Full control, can manage all aspects
- **Admin** - Administrative access
- **Lead** - Team lead with elevated permissions
- **Contributor** - Can contribute to work
- **Viewer** - Read-only access

### Status
- **Pending** - Invitation sent, awaiting response
- **Accepted** - User accepted the invitation
- **Rejected** - User declined the invitation
- **Active** - Currently collaborating
- **Inactive** - No longer collaborating

### Collaboration Types
- **Campaign** - Collaborate on marketing campaigns
- **Business** - Business team members
- **Project** - Project collaboration
- **Referral** - Referral system

## Key Files

| File | Purpose |
|------|---------|
| `src/types/collaboration.types.ts` | Type definitions and enums |
| `src/db/entity/Collaboration.entity.ts` | Database entity |
| `src/services/collaboration.service.ts` | Business logic |
| `src/controllers/collaboration.controller.ts` | HTTP handlers |
| `src/routes/collaboration.routes.ts` | API endpoints |
| `COLLABORATION_FEATURE.md` | Full documentation |

## Common Operations

### Create Invitation
```typescript
// Using the service directly
await collaborationService.createCollaborationInvite({
  collaborationType: 'Campaign',
  entityId: 5,
  inviterId: userId,
  inviteeEmail: 'user@example.com',
  role: 'Contributor',
  message: 'Join our team!',
  expiresIn: 168, // 7 days
});
```

### Get User's Invitations
```typescript
const invitations = await collaborationService.getCollaborationInvites(userId);
```

### Accept Invitation
```typescript
await collaborationService.acceptCollaborationInvite(invitationId, userId);
```

### Get Campaign Collaborators
```typescript
const collaborators = await collaborationService.getCampaignCollaborators(campaignId);
```

### Update Collaborator Role
```typescript
await collaborationService.updateCollaboratorRole(collaborationId, 'Lead', requesterId);
```

### Remove Collaborator
```typescript
await collaborationService.removeCollaborator(collaborationId, requesterId);
```

## API Quick Start

### 1. Invite Someone
```bash
POST /api/collaborations/invite
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "collaborationType": "Campaign",
  "entityId": 1,
  "inviteeEmail": "user@example.com",
  "role": "Contributor",
  "message": "Join the team!"
}
```

### 2. View Pending Invitations
```bash
GET /api/collaborations/pending
Authorization: Bearer <TOKEN>
```

### 3. Accept Invitation
```bash
POST /api/collaborations/accept
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "invitationId": 1
}
```

### 4. View Campaign Team
```bash
GET /api/collaborations/campaign/1
```

### 5. Update Someone's Role
```bash
PUT /api/collaborations/1/role
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "role": "Lead"
}
```

### 6. Remove Collaborator
```bash
DELETE /api/collaborations/1
Authorization: Bearer <TOKEN>
```

## Invitations

### How Invitations Work
1. **Invite Created** - Sender creates invitation with token
2. **Email Sent** - User receives invitation (optional implementation)
3. **User Accepts/Rejects** - User responds to invitation
4. **Status Updates** - Collaboration status changes accordingly
5. **Expiration** - Invitations expire after set time (default 7 days)

### Invitation Token
- Unique UUID v4 generated for each invitation
- Used for secure invitation verification
- Expires if not accepted within timeframe
- Can be used for invitation links: `/invite?token=<uuid>`

## Authorization

### Who Can Do What?

| Operation | Allowed For |
|-----------|------------|
| Create Invitation | Authenticated users |
| Accept Invitation | Invitee (by email or ID) |
| Reject Invitation | Invitee |
| View My Invitations | Current user |
| View Team Members | Anyone |
| Update Role | Invitation creator (inviter) |
| Remove Member | Invitation creator (inviter) |

## Database

### Collaboration Table
- `id` - Primary key
- `collaborationType` - Type of collaboration
- `campaign_id` - Link to campaign (nullable)
- `business_id` - Link to business (nullable)
- `inviter_id` - User who invited
- `invitee_id` - User invited (nullable)
- `inviteeEmail` - Email of invitee
- `role` - Collaborator's role
- `status` - Current status
- `invitationToken` - Unique invitation token
- `expiresAt` - When invitation expires
- `acceptedAt` - When accepted
- `message` - Optional message
- `createdAt` - Creation timestamp
- `updatedAt` - Last updated timestamp

## Error Responses

### Common Errors
```json
{
  "error": "Unauthorized",
  "message": "User ID is required"
}
```

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad request
- `401` - Unauthorized
- `404` - Not found
- `500` - Server error

## Testing Checklist

- [ ] Create invitation with email
- [ ] Create invitation with user ID
- [ ] Accept invitation as invitee
- [ ] Reject invitation
- [ ] View pending invitations
- [ ] View accepted collaborations
- [ ] Update collaborator role
- [ ] Remove collaborator
- [ ] Verify invitation token
- [ ] Test invitation expiration
- [ ] Test authorization (non-inviter cannot update)

## Notes

- Invitations can be sent to non-registered users (by email)
- User registration automatically links email-based invitations
- Collaborators are distinct from campaign team members
- Removing campaign/business cascades to collaborations
- All timestamps are UTC

## Future Additions

- Email notifications
- Invitation resend
- Bulk invitations
- Collaboration analytics
- Permission inheritance
- Activity logs
