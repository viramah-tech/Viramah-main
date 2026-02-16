# Viramah Backend Testing Guide

> Step-by-step instructions to test every layer of the backend.

---

## 🏃 Quick Start — Run All Unit Tests

```bash
# Run all tests (one-shot)
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# With coverage report
npm run test:coverage
```

**Expected output:** `64 passed (64)` — all tests green.

---

## 📋 Testing Layers (Bottom → Top)

### Layer 1: Unit Tests (✅ Already Created — No Setup Needed)

These test pure logic without any external dependencies:

| Test File | What it Tests | Tests |
|-----------|---------------|-------|
| `pricing.service.test.ts` | Pricing engine, seasonal rates, promo codes, GST | 15 |
| `auth.schema.test.ts` | Phone number format (+91), OTP validation | 12 |
| `booking.schema.test.ts` | UUID format, date ordering, reason length | 10 |
| `payment.schema.test.ts` | Amount limits, signature payload format | 8 |
| `kyc.schema.test.ts` | Document types, number length, image URLs | 7 |
| `errors.test.ts` | Error status codes, JSON serialization, inheritance | 12 |

**Run:** `npm test`

---

### Layer 2: Health Check Endpoint (No Supabase Needed)

**Step 1:** Make sure dev server is running:
```bash
npm run dev
```

**Step 2:** Test the health check:
```bash
# In PowerShell:
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/health" | ConvertTo-Json

# Or in browser:
# Navigate to http://localhost:3000/api/v1/health
```

**Expected response (before Supabase setup):**
```json
{
  "status": "degraded",
  "checks": {
    "api": "ok",
    "timestamp": "2026-02-16T...",
    "environment": "development",
    "supabase_url": "missing",
    "supabase_anon_key": "missing",
    "supabase_service_key": "missing",
    "razorpay": "not_configured",
    "redis": "not_configured",
    "twilio": "not_configured",
    "sendgrid": "not_configured"
  },
  "version": "1.0.0"
}
```

This confirms the API routing layer works. Status will change to `"healthy"` after Supabase setup.

---

### Layer 3: Supabase Setup (Required for API Endpoint Testing)

**Step 1:** Go to [supabase.com](https://supabase.com) → Create a new project → Choose a password.

**Step 2:** Get your keys from **Settings → API**:
- `Project URL` → your Supabase URL
- `anon public` key → anon key
- `service_role` key → admin key

**Step 3:** Create `.env.local` in project root:
```bash
# Copy the template
copy .env.example .env.local
```

**Step 4:** Fill in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Step 5:** Run the database migrations in Supabase SQL Editor:
- Go to **SQL Editor** in your Supabase dashboard
- Run these files in order:
  1. `src/backend/supabase/migrations/00001_initial_schema.sql`
  2. `src/backend/supabase/migrations/00002_add_bookings.sql`
  3. `src/backend/supabase/migrations/00003_parent_portal.sql`
  4. `src/backend/supabase/policies/rls_policies.sql`
  5. `src/backend/supabase/seeds/001_properties_rooms.sql`

**Step 6:** Restart the dev server:
```bash
# Stop the running server (Ctrl+C), then:
npm run dev
```

**Step 7:** Verify health check shows `"healthy"`:
```bash
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/health" | ConvertTo-Json
```

---

### Layer 4: API Endpoint Testing (After Supabase Setup)

#### 4a. Public Endpoints (No Auth Token Needed)

**Test rooms listing:**
```powershell
# List all rooms
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/rooms" | ConvertTo-Json -Depth 5

# Filter by city
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/rooms?city=Bangalore" | ConvertTo-Json -Depth 5

# Filter by type
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/rooms?type=1-seater" | ConvertTo-Json -Depth 5

# Filter by price range
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/rooms?minPrice=5000&maxPrice=10000" | ConvertTo-Json -Depth 5

# Pagination
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/rooms?page=1&limit=3" | ConvertTo-Json -Depth 5
```

**Test OTP send (sends SMS in production, logs in dev):**
```powershell
$body = @{ phone = "+919876543210" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/otp/send" -Method POST -Body $body -ContentType "application/json" | ConvertTo-Json
```

**Test OTP send validation (should fail):**
```powershell
# Invalid phone (should return 400)
$body = @{ phone = "1234" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/otp/send" -Method POST -Body $body -ContentType "application/json"
```

#### 4b. Auth-Protected Endpoints (Need Token)

**Step 1:** Create a test user in Supabase:
- Go to **Authentication → Users** in Supabase dashboard
- Click **Add User** → add email/password user
- Note the user's UUID

**Step 2:** Get an access token:
```powershell
# Option A: Use Supabase dashboard → SQL Editor:
# SELECT * FROM auth.users;
# Then use the Supabase client to sign in

# Option B: Use the Supabase REST API directly:
$signInBody = @{
    email = "test@viramah.com"
    password = "your-password"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://YOUR_PROJECT.supabase.co/auth/v1/token?grant_type=password" `
    -Method POST `
    -Body $signInBody `
    -ContentType "application/json" `
    -Headers @{ apikey = "YOUR_ANON_KEY" }

$TOKEN = $response.access_token
Write-Host "Token: $TOKEN"
```

**Step 3:** Test protected endpoints with the token:
```powershell
# Get profile
$headers = @{ Authorization = "Bearer $TOKEN" }
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/user/profile" -Headers $headers | ConvertTo-Json -Depth 5

# Get KYC status
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/user/kyc" -Headers $headers | ConvertTo-Json -Depth 5

# Submit KYC
$kycBody = @{
    documentType = "aadhaar"
    documentNumber = "123456789012"
    documentImageFront = "https://example.com/front.jpg"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/user/kyc" -Method POST -Headers $headers -Body $kycBody -ContentType "application/json" | ConvertTo-Json -Depth 5

# Create booking
$bookingBody = @{
    roomId = "aaaa1111-1111-1111-1111-111111111111"
    checkIn = "2026-08-01"
    checkOut = "2026-09-01"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/bookings" -Method POST -Headers $headers -Body $bookingBody -ContentType "application/json" | ConvertTo-Json -Depth 5

# List bookings
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/bookings" -Headers $headers | ConvertTo-Json -Depth 5

# Get wallet
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/student/wallet" -Headers $headers | ConvertTo-Json -Depth 5
```

#### 4c. Test Error Handling

```powershell
# No auth token (should return 401)
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/user/profile"

# Invalid booking data (should return 400 with validation errors)
$headers = @{ Authorization = "Bearer $TOKEN" }
$badBooking = @{
    roomId = "not-a-uuid"
    checkIn = "invalid"
    checkOut = "2026-01-01"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/bookings" -Method POST -Headers $headers -Body $badBooking -ContentType "application/json"

# Negative payment amount (should return 400)
$badPayment = @{
    bookingId = "550e8400-e29b-41d4-a716-446655440000"
    amount = -100
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/payments/order" -Method POST -Headers $headers -Body $badPayment -ContentType "application/json"
```

---

### Layer 5: Database Verification (Supabase Dashboard)

After running the API tests, verify data was created correctly:

1. Go to **Table Editor** in Supabase dashboard
2. Check these tables have data:
   - `properties` — Should have 3 seeded properties
   - `rooms` — Should have 7 seeded rooms
   - `profiles` — Should have profile for your test user
   - `bookings` — Should have the booking you created
   - `kyc_documents` — Should have the KYC submission

3. Check **RLS is working:**
   - Go to **SQL Editor** and run:
   ```sql
   -- This should return rows (public access)
   SELECT * FROM rooms;
   
   -- Verify profile was auto-created
   SELECT * FROM profiles;
   
   -- Check seed data
   SELECT p.name, r.room_number, r.type, r.base_price
   FROM rooms r
   JOIN properties p ON r.property_id = p.id
   ORDER BY p.name, r.room_number;
   ```

---

## 🧪 Test Checklist

| # | Test | Type | Status |
|---|------|------|--------|
| 1 | `npm test` — 64 unit tests pass | Unit | ⬜ |
| 2 | Health check returns JSON | API | ⬜ |
| 3 | Supabase project created | Setup | ⬜ |
| 4 | `.env.local` configured | Setup | ⬜ |
| 5 | Migrations run successfully | DB | ⬜ |
| 6 | Seed data visible in dashboard | DB | ⬜ |
| 7 | Health check shows "healthy" | API | ⬜ |
| 8 | `GET /api/v1/rooms` returns rooms | API | ⬜ |
| 9 | `POST /api/v1/auth/otp/send` works | API | ⬜ |
| 10 | Validation errors return 400 | API | ⬜ |
| 11 | Test user created in Supabase | Auth | ⬜ |
| 12 | Auth token obtained | Auth | ⬜ |
| 13 | `GET /api/v1/user/profile` works | API | ⬜ |
| 14 | `POST /api/v1/user/kyc` works | API | ⬜ |
| 15 | `POST /api/v1/bookings` works | API | ⬜ |
| 16 | `GET /api/v1/bookings` lists booking | API | ⬜ |
| 17 | `GET /api/v1/student/wallet` works | API | ⬜ |
| 18 | Unauthenticated requests return 401 | Auth | ⬜ |
| 19 | Data appears correctly in Supabase tables | DB | ⬜ |
| 20 | RLS policies prevent cross-user access | Security | ⬜ |

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| `npm test` fails with import errors | Run `npm install` to ensure vitest is installed |
| Health check returns 503 | `.env.local` is missing or has wrong keys |
| 401 on all routes | Token expired — get a new one from Supabase |
| Migration SQL errors | Run migrations in order (00001 → 00002 → 00003 → policies) |
| No seed data | Run `001_properties_rooms.sql` in SQL Editor |
| `ECONNREFUSED` | Dev server not running — run `npm run dev` |
