# 🎯 Job Board Feature - Start Here

## Your Question Answered ✅

**"How do I test this? Since I'm posting, I should be a creator, right?"**

**YES! Exactly right!** Only **Creators** can post jobs. Here's what you need to do:

## 5-Minute Quick Start

```bash
# 1. Register
POST /api/auth/register
→ Save the token from response

# 2. Verify email (check your email inbox)
GET /api/auth/verify/{token_from_email}

# 3. Login
POST /api/auth/login
→ Get a NEW token (use this one!)

# 4. Become a Creator
PUT /api/auth/account-type
Authorization: Bearer {token}
Body: {"accountType": "Creator"}

# 5. Create a Job! 🎉
POST /api/jobs
Authorization: Bearer {token}
Body: {values, goals, skills, contents, platforms}
```

## 📚 Documentation (Pick One)

| Guide | Best For | Time |
|-------|----------|------|
| **[JOB_BOARD_READY.md](JOB_BOARD_READY.md)** | Start here! Complete overview | 5 min |
| **[QUICK_REFERENCE_JOB_BOARD.md](QUICK_REFERENCE_JOB_BOARD.md)** | Quick lookup during testing | 2 min |
| **[JOB_BOARD_VISUAL_GUIDE.md](JOB_BOARD_VISUAL_GUIDE.md)** | Diagrams, flows, matrices | 10 min |
| **[COMPLETE_JOB_BOARD_WORKFLOW.md](COMPLETE_JOB_BOARD_WORKFLOW.md)** | Full examples with requests | 15 min |
| **[JOB_BOARD_TESTING_GUIDE.md](JOB_BOARD_TESTING_GUIDE.md)** | Detailed testing instructions | 20 min |
| **[JOB_BOARD_IMPLEMENTATION_SUMMARY.md](JOB_BOARD_IMPLEMENTATION_SUMMARY.md)** | Technical deep dive | 10 min |

## 🔑 Key Points

### Authentication Flow
```
Register → Verify Email → Login → Become Creator → Create Jobs
```

### Authentication Rule
✅ **You MUST be a Creator to POST jobs**
```typescript
// Only creators can create jobs
if (user.accountType !== "Creator") {
  return 400 "Bad Request - Not a Creator"
}
```

### API Endpoints
```
POST   /api/jobs              ← Create job (auth + creator)
GET    /api/jobs              ← View all jobs (public)
GET    /api/jobs/:id          ← View job (public)
GET    /api/jobs/my-jobs      ← Your jobs (auth)
PUT    /api/jobs/:id          ← Update job (auth + owner)
DELETE /api/jobs/:id          ← Delete job (auth + owner)

PUT    /api/auth/account-type ← Become creator (auth)
```

### Authentication Header
All authenticated requests need:
```
Authorization: Bearer {jwt_token}
```

## 🧪 Testing Checklist

- [ ] Register a user
- [ ] Verify email
- [ ] Login
- [ ] Update account type to "Creator"
- [ ] Create a job
- [ ] View all jobs (no auth)
- [ ] View your jobs (with auth)
- [ ] Update your job
- [ ] Delete your job

## 📊 What's Been Added

### New Files Created
- ✅ `src/types/job.types.ts` - Type definitions
- ✅ `src/db/entity/Job.entity.ts` - Database entity
- ✅ `src/services/job.service.ts` - Business logic
- ✅ `src/controllers/job.controller.ts` - Request handlers
- ✅ `src/routes/job.routes.ts` - API endpoints
- ✅ 6 documentation files

### Files Modified
- ✅ `src/controllers/auth.controller.ts` - Added updateAccountType()
- ✅ `src/routes/auth.routes.ts` - Added account-type route
- ✅ `src/db/data-source.ts` - Registered Job entities
- ✅ `src/index.ts` - Mounted job routes

### No Errors! ✅
All files compiled successfully with zero TypeScript errors.

## 🚀 Ready to Test?

1. Start your server: `npm run dev`
2. Follow **Quick Start** section above, OR
3. Pick a documentation file from the table above

## 💡 Pro Tips

### Using Postman
1. Create collection variable: `token`
2. After login, copy token to variable
3. Use `Authorization: Bearer {{token}}` in headers

### Using cURL
```bash
# Get token
TOKEN=$(curl ... | jq -r '.token')

# Use in requests
curl -H "Authorization: Bearer $TOKEN" ...
```

### Important Notes
- ⏰ **Token expires in 24 hours** - login again when needed
- 📧 **Email must be verified** - check inbox for verification link
- 👤 **Must be Creator** - use PUT /api/auth/account-type
- 🔒 **Only you can edit your jobs** - system validates owner
- 🌐 **Jobs are public** - anyone can view without auth

## ❓ FAQ

**Q: Why do I need to become a Creator?**
A: To distinguish between regular users and content creators who post jobs.

**Q: Can I change my account type back?**
A: Yes, use PUT /api/auth/account-type with a different type.

**Q: Can I view jobs without logging in?**
A: Yes! GET /api/jobs is public - anyone can view.

**Q: What if I forget my token?**
A: Login again with POST /api/auth/login to get a new one.

**Q: Can I edit someone else's job?**
A: No - you can only edit/delete jobs you created.

## 📞 Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Missing/invalid token | Login again |
| 403 Forbidden | Not job owner | You can only modify your jobs |
| 400 Bad Request | Not a Creator | Use PUT /api/auth/account-type |
| Email not verified | Email not verified | Click link in email |
| Token expired | 24 hours passed | Login again |

---

**Next Step:** Read [JOB_BOARD_READY.md](JOB_BOARD_READY.md) for a complete overview, or jump straight to testing with the Quick Start above! 🚀

Happy testing! 🎉
