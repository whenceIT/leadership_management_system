🪜 Step-by-Step (What You Fuse in the Auth logic)
1️⃣ Login (Server Action)

Call POST /auth/login

Receive user object

Generate random session_id

Save session server-side

Set session_id cookie

2️⃣ Session Storage

Store:

user_id

office_id

role

expiry

3️⃣ Session Resolver

Single utility:

Reads cookie

Fetches session

Returns null if invalid

4️⃣ Middleware

Protect routes

Redirect unauthenticated users

Prevent logged-in users hitting /login

5️⃣ UI State (Optional)

Hydrate from server session

React context for display only

6️⃣ Logout

Delete session server-side

Delete cookie

Redirect to /login