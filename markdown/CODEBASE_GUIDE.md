# Paza Backend — Complete Codebase Guide

## What is this project?

This is a **backend API** for the Paza app. Think of it as the "server" that handles:
- User registration and login (authentication)
- Business management (creating/managing businesses)
- User roles and permissions (who can do what)
- Email notifications (sending emails to users)
- Social platform verification (verifying YouTube channels, etc.)

**Technology stack:**
- **Node.js + Express** — the web framework (handles HTTP requests)
- **TypeScript** — JavaScript with type safety (catches bugs before they run)
- **PostgreSQL** — database (stores users, businesses, etc.)
- **TypeORM** — database ORM (lets you work with the database using JavaScript instead of raw SQL)
- **JWT (JSON Web Tokens)** — authentication (secure way to know who the user is)

---

## Project structure explained

```
paza-backend/
├── src/
│   ├── index.ts                    # Entry point — starts the server
│   ├── swagger.ts                  # API documentation
│   ├── controllers/                # Request handlers
│   ├── services/                   # Business logic & integrations
│   ├── middleware/                 # Middleware (auth, validation, etc.)
│   ├── routes/                     # API endpoint definitions
│   ├── db/
│   │   ├── data-source.ts          # Database connection config
│   │   └── entity/                 # Database models (tables)
│   └── utils/                      # Helper functions
├── package.json                    # Dependencies & npm scripts
├── tsconfig.json                   # TypeScript config
└── jest.config.js                  # Testing config
```

---

## How the app works (Request flow)

When a user makes an HTTP request to your API, here's what happens:

```
1. User makes HTTP request
   └─> GET /api/auth/verify/abc123
   
2. Express routes to the handler
   └─> routes/auth.routes.ts → AuthController.verifyEmail()
   
3. Controller calls a service
   └─> services/email.service.ts (or other services)
   
4. Service touches the database
   └─> db/entity/User.ts → User.findOne() → queries PostgreSQL
   
5. Database returns data
   └─> User entity instance created
   
6. Service processes & returns response
   └─> Controller sends JSON back to client
```

**Example: User registration**
```
User submits form → POST /api/auth/register
    ↓
AuthController.register() receives request
    ↓
Validates input (email, password, etc.)
    ↓
Hashes password using bcrypt
    ↓
Creates new User entity
    ↓
Saves to PostgreSQL via TypeORM
    ↓
EmailService.sendVerificationEmail() called
    ↓
Nodemailer sends email
    ↓
Controller returns JWT token & user data to client
```

---

## Key files explained

### 1. **src/index.ts** — The entry point

This is where the app starts. It:
- Loads environment variables (from `.env` file)
- Sets up Express middleware (cors, helmet, json parsing)
- Initializes the database connection
- Mounts routes (`/api/auth`, `/api/social-verification`)
- Sets up error handling
- Starts the server on port 5000

**Key lines:**
```typescript
AppDataSource.initialize()  // Connect to PostgreSQL
  .then(() => {
    app.listen(PORT, ...)   // Start HTTP server
  })
```

### 2. **src/db/data-source.ts** — Database connection

This file:
- Configures the PostgreSQL connection (host, port, credentials)
- Lists all entities (tables) the database will create
- Sets `synchronize: true` — auto-creates/updates tables from entity definitions

**Key entities registered:**
- `User` — user accounts
- `Business` — business profiles
- `BusinessMember` — links users to businesses with roles
- `CreatorProfile` — creator-specific info
- `SocialVerification` — verification records for YouTube, etc.

### 3. **src/db/entity/** — Database models

Each file here is a TypeScript class that maps to a database table.

#### **User.ts** — Stores user accounts
```typescript
@Entity("users")
export class User extends BaseEntity {
  id: number              // unique ID
  email: string          // unique email
  password: string       // hashed password (bcrypt)
  firstName: string
  lastName: string
  birthday: Date
  gender: string         // "Male", "Female", "Other"
  phone: string
  city: string
  isVerified: boolean    // email verified?
  accountType: string    // "Individual", "Business", "Creator"
  verificationToken: string  // for email verification link
  resetPasswordToken: string // for password reset
  
  // Relationships
  socialVerifications: SocialVerification[]  // many
  businessMembers: BusinessMember[]         // many
  creatorProfile: CreatorProfile            // one
}
```

#### **Business.entity.ts** — Business profiles
```typescript
@Entity("businesses")
export class Business extends BaseEntity {
  id: number
  name: string
  description: string
  website: string
  industry: string
  founded: Date
  
  // Relationships
  owner: User            // One owner
  members: BusinessMember[]  // Many members
}
```

#### **BusinessMember.entity.ts** — Membership (User + Business + Role)
```typescript
@Entity("business_members")
export class BusinessMember extends BaseEntity {
  id: number
  user: User             // which user?
  business: Business     // which business?
  role: string           // "Admin", "Lead", "Member", "Community"
  isApproved: boolean    // membership approved?
}
```

Example: John is Admin of Acme Corp, Jane is Member of Acme Corp.

#### **CreatorProfile.entity.ts** — Creator-specific info
```typescript
@Entity("creator_profiles")
export class CreatorProfile extends BaseEntity {
  id: number
  user: User             // which user is the creator?
  youtubeChannelId: string
  youtubeChannelName: string
  subscriberCount: number
}
```

#### **SocialVerification.ts** — Verification records
```typescript
@Entity("social_verifications")
export class SocialVerification extends BaseEntity {
  id: number
  user: User
  platform: string       // "youtube", "instagram", etc.
  platformId: string
  verificationToken: string
  isVerified: boolean
}
```

---

## Routes & Controllers

### **src/routes/auth.routes.ts** — Auth endpoints

Maps endpoints to controller methods:
```typescript
POST   /api/auth/register          → Register new user
GET    /api/auth/verify/:token     → Verify email
POST   /api/auth/resend-verification → Resend verification email
POST   /api/auth/login             → Login with email/password
GET    /api/auth/login/google/auth-url → Get Google OAuth URL
POST   /api/auth/login/google      → Login with Google
POST   /api/auth/forgot-password   → Request password reset
POST   /api/auth/reset-password/:token → Reset password
```

### **src/routes/social-verification.routes.ts** — Social verification endpoints

```typescript
POST   /api/social-verification/youtube/initiate → Start YouTube verification
POST   /api/social-verification/youtube/verify   → Complete YouTube verification
```

### **src/controllers/auth.controller.ts** — Request handlers

Example method:
```typescript
async register(req: Request, res: Response) {
  // 1. Get email/password from request body
  const { email, password, firstName, ... } = req.body;
  
  // 2. Validate inputs
  if (!email || !password) return res.status(400).json({error: "..."});
  
  // 3. Check if user already exists
  const existing = await User.findOne({ where: { email } });
  if (existing) return res.status(400).json({error: "User exists"});
  
  // 4. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // 5. Create user
  const user = User.create({
    email,
    password: hashedPassword,
    firstName,
    ...
    verificationToken: generateVerificationToken(),
    isVerified: false
  });
  await user.save();
  
  // 6. Send verification email
  await emailService.sendVerificationEmail(email, user.verificationToken, firstName);
  
  // 7. Generate JWT token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET
  );
  
  // 8. Return response
  res.status(201).json({
    message: "User registered successfully",
    token,
    user
  });
}
```

---

## Services

### **src/services/email.service.ts** — Email sending

Sends emails using Nodemailer (SMTP):
```typescript
class EmailService {
  sendVerificationEmail(to, token, name) {
    // Constructs HTML email with verification link
    // Sends via SMTP
  }
  
  sendPasswordResetEmail(to, token, name) {
    // Sends password reset email
  }
}
```

### **src/services/social.verification.ts** — Social platform verification

Logic for verifying YouTube channels, etc.

---

## Middleware

### **src/middleware/auth.middleware.ts** — JWT authentication

Protects endpoints that require login:

```typescript
export const authenticate = async (req, res, next) => {
  // 1. Get Authorization header
  const token = req.header("Authorization")?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  
  // 2. Verify JWT token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  // 3. Find user by ID
  const user = await User.findOne({ where: { id: decoded.userId } });
  
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }
  
  // 4. Attach user to request object
  req.user = user;
  
  // 5. Continue to next middleware/controller
  next();
};
```

**Usage in a route:**
```typescript
// Protected endpoint (requires login)
router.post("/youtube/initiate", authenticate, controller.initiateYoutubeVerification);
```

---

## Environment variables (.env file)

The app reads these from a `.env` file (you need to create this):

```
# Server
PORT=5000

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=paza_db

# Authentication
JWT_SECRET=your_secret_key_here

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_password
EMAIL_FROM=noreply@paza.app
EMAIL_FROM_NAME=Paza App

# URLs
APP_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

---

## Common tasks & where to find the code

### Task: Add a new endpoint (e.g., get user profile)

1. **Create the route** in `src/routes/auth.routes.ts`:
```typescript
router.get("/profile/:id", authenticate, authController.getProfile);
```

2. **Add controller method** in `src/controllers/auth.controller.ts`:
```typescript
async getProfile(req: Request, res: Response) {
  const userId = req.params.id;
  const user = await User.findOne({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
}
```

3. **Test the endpoint:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/auth/profile/1
```

### Task: Add a new database table (entity)

1. Create new file: `src/db/entity/MyEntity.ts`
```typescript
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("my_table")
export class MyEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
```

2. Register in `src/db/data-source.ts`:
```typescript
import { MyEntity } from "./entity/MyEntity";

const AppDataSource = new DataSource({
  // ...
  entities: [User, SocialVerification, Business, BusinessMember, CreatorProfile, MyEntity], // Add here
  // ...
});
```

3. Restart the server — TypeORM will auto-create the table.

### Task: Add email notifications

Use `src/services/email.service.ts`:
```typescript
const emailService = new EmailService();
await emailService.sendVerificationEmail("user@example.com", "token123", "John");
```

---

## Development workflow

```bash
# 1. Install dependencies
npm install

# 2. Create .env file (see Environment variables section above)
cp .env.example .env  # if it exists, or create manually

# 3. Start PostgreSQL (Docker or local)
docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15

# 4. Start dev server (watches for changes)
npm run dev

# 5. Server starts on http://localhost:5000
# → API docs: http://localhost:5000/api-docs (Swagger)

# 6. Run tests
npm test

# 7. Lint code
npm run lint
npm run lint:fix

# 8. Build for production
npm run build

# 9. Start production server
npm start
```

---

## Quick reference: What each file does

| File | Purpose |
|------|---------|
| `src/index.ts` | Server entry point, middleware setup |
| `src/swagger.ts` | API documentation config |
| `src/db/data-source.ts` | Database connection & entity registration |
| `src/db/entity/*.ts` | Database table definitions |
| `src/routes/*.routes.ts` | API endpoint definitions |
| `src/controllers/*.controller.ts` | HTTP request handlers |
| `src/services/*.ts` | Business logic & external integrations |
| `src/middleware/auth.middleware.ts` | JWT authentication |
| `src/utils/token.utils.ts` | Token generation helpers |
| `package.json` | Dependencies & npm scripts |
| `.env` | Environment variables (you create this) |

---

## Troubleshooting

**Problem:** "Error during Data Source initialization: ECONNREFUSED"
- **Solution:** PostgreSQL isn't running. Start it:
  ```bash
  docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
  ```

**Problem:** "Cannot find module 'dotenv'"
- **Solution:** Install dependencies:
  ```bash
  npm install
  ```

**Problem:** "JWT_SECRET is undefined"
- **Solution:** Create `.env` file with `JWT_SECRET=your_secret`

**Problem:** "Unexpected token <" in Swagger
- **Solution:** Restart server after editing routes

---

## Next steps

1. **Read** the `.github/copilot-instructions.md` file for quick reference
2. **Explore** the files in the order listed above
3. **Try** making a small change (e.g., add a new endpoint)
4. **Run tests** to see if everything works
5. **Ask questions** if you get stuck!

---

## Need help with a specific part?

Let me know which area you'd like me to dive deeper into:
- How authentication works?
- How to add a new endpoint?
- How the database relationships work?
- How email sending works?
- How to write tests?

I'm here to help! 🚀
