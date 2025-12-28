# Backend Setup Guide

This guide will walk you through setting up the Voice Audit backend with Firebase, Gemini, and Google APIs integration.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase project
- Google Cloud project

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Firebase Setup

### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

### 2.2 Enable Authentication

1. In Firebase Console, go to **Authentication** → **Get started**
2. Enable **Email/Password** sign-in method
3. Enable **Google** sign-in provider (optional, if using Google auth)

### 2.3 Get Service Account Key

1. Go to **Project Settings** (gear icon) → **Service Accounts**
2. Click **Generate new private key**
3. Download the JSON file
4. Rename it to `serviceAccount.json` and place it in the `backend/` directory
5. **Important**: Add `serviceAccount.json` to `.gitignore` (already included)

### 2.4 Enable Firestore

1. Go to **Firestore Database** → **Create database**
2. Start in **test mode** (for development)
3. Choose a location for your database

## Step 3: Gemini API Setup

### 3.1 Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Copy the API key

### 3.2 Add to Environment Variables

Add the key to your `.env` file:
```
GEMINI_API_KEY=your_api_key_here
```

## Step 4: Google OAuth2 Setup

### 4.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

### 4.2 Enable Required APIs

Enable the following APIs in your Google Cloud project:

1. **Google Calendar API**
   - Go to [API Library](https://console.cloud.google.com/apis/library)
   - Search for "Google Calendar API"
   - Click **Enable**

2. **Google Tasks API**
   - Search for "Google Tasks API"
   - Click **Enable**

3. **Gmail API**
   - Search for "Gmail API"
   - Click **Enable**

### 4.3 Configure OAuth Consent Screen

#### Step 1: Navigate to OAuth Consent Screen
1. In Google Cloud Console, click the **☰ (hamburger menu)** in the top left
2. Go to **APIs & Services** → **OAuth consent screen**
   - If this is your first time, you'll see a page asking to configure the consent screen
   - If already configured, you'll see the current settings

#### Step 2: Choose User Type
1. Select **External** (unless you have a Google Workspace account)
2. Click **Create**

#### Step 3: Fill App Information
1. On the **App information** page, fill in:
   - **App name**: "Voice Audit"
   - **User support email**: Select your email from the dropdown
   - **App logo**: (Optional - can skip)
   - **App domain**: (Optional - can skip for development)
   - **Application home page**: (Optional - can skip)
   - **Application privacy policy link**: (Optional - can skip)
   - **Application terms of service link**: (Optional - can skip)
   - **Authorized domains**: (Optional - can skip)
   - **Developer contact information**: Select your email from the dropdown
2. Click **Save and Continue** at the bottom

#### Step 4: Add Scopes (THIS IS THE IMPORTANT STEP)
1. You'll now be on the **Scopes** page
2. Look for a section that says **"Scopes"** or **"What endpoints will your app access?"**
3. You'll see one of two scenarios:

   **Scenario A: If you see a button that says "ADD OR REMOVE SCOPES" or "MANAGE SCOPES"**
   - Click that button
   - A popup window will open
   - In the popup, you'll see a search box at the top
   - **For Calendar scope:**
     - Type "calendar" in the search box
     - Look for: `https://www.googleapis.com/auth/calendar`
     - Check the checkbox next to it
   - **For Tasks scope:**
     - Type "tasks" in the search box
     - Look for: `https://www.googleapis.com/auth/tasks`
     - Check the checkbox next to it
   - **For Gmail scope:**
     - Type "gmail.send" in the search box
     - Look for: `https://www.googleapis.com/auth/gmail.send`
     - Check the checkbox next to it
   - After selecting all three, click **UPDATE** or **SAVE** button in the popup
   - The popup will close and you'll see the scopes listed on the main page

   **Scenario B: If you see a list of scopes already displayed**
   - Look for a **"+"** button or **"ADD SCOPES"** button
   - Click it to open the scope selection
   - Follow the same search process as Scenario A

   **Scenario C: If you see a table with scope names**
   - Look for an **"ADD SCOPES"** button (usually at the top right)
   - Click it and follow the search process

4. After adding scopes, you should see all three scopes listed:
   - `https://www.googleapis.com/auth/calendar` - See, edit, share, and permanently delete all the calendars you can access using Google Calendar
   - `https://www.googleapis.com/auth/tasks` - Create, edit, organize, and delete all your tasks
   - `https://www.googleapis.com/auth/gmail.send` - Send email on your behalf
5. Click **Save and Continue** at the bottom of the page

#### Step 5: Add Test Users (For Testing Mode)
1. If your app is in **Testing** mode, you'll see a **Test users** page
2. Click **+ ADD USERS** button
3. Enter your email address (the one you'll use to test)
4. Click **ADD**
5. Your email should appear in the test users list
6. Click **Save and Continue**

#### Step 6: Review Summary
1. Review all the information you've entered
2. Click **BACK TO DASHBOARD** or **SAVE AND CONTINUE**

**Important Notes:**
- If you can't find the scopes, make sure you've enabled the APIs first (Step 4.2)
- The scopes might be listed under different names - search for the exact URLs provided
- If you're still having trouble, try searching for just "calendar", "tasks", or "gmail" without the full URL

### 4.4 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Choose **Web application**
4. Configure:
   - Name: "Voice Audit Backend"
   - Authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback` (development)
     - Add production URL when deploying
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

### 4.5 Add to Environment Variables

Add to your `.env` file:
```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
```

## Step 5: Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in all the required values in `.env`:
   ```env
   # Firebase
   FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccount.json
   
   # Gemini
   GEMINI_API_KEY=your_actual_key_here
   
   # Google OAuth2
   GOOGLE_CLIENT_ID=your_actual_client_id
   GOOGLE_CLIENT_SECRET=your_actual_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
   
   # Server
   PORT=5000
   NODE_ENV=development
   ```

## Step 6: Build and Run

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
# Build TypeScript
npm run build

# Run compiled JavaScript
npm start
```

The server will start on `http://localhost:5000` (or the port specified in `.env`).

## Step 7: Verify Setup

1. Check health endpoint:
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"status":"ok","message":"Backend is running"}`

2. Test authentication flow:
   - Frontend should call `GET /api/auth/google/url` to get authorization URL
   - User authorizes in browser
   - Callback stores tokens in Firestore

## API Endpoints

### POST /api/process
Process text input and execute action (Calendar/Task/Email)

**Headers:**
```
Authorization: Bearer <firebase_id_token>
Content-Type: application/json
```

**Body:**
```json
{
  "text": "Schedule a meeting tomorrow at 2pm"
}
```

**Response:**
```json
{
  "success": true,
  "action": "calendar",
  "message": "Calendar event created successfully",
  "data": {
    "id": "event_id",
    "title": "Meeting",
    "start": "2024-01-15T14:00:00Z",
    "end": "2024-01-15T15:00:00Z"
  }
}
```

### GET /api/auth/google/url
Get Google OAuth2 authorization URL

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Response:**
```json
{
  "success": true,
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

### GET /api/auth/google/callback
OAuth2 callback endpoint (handled automatically by Google)

## Troubleshooting

### Firebase Admin Error
- Ensure `serviceAccount.json` is in the `backend/` directory
- Or set `FIREBASE_SERVICE_ACCOUNT` environment variable with JSON string

### Gemini API Error
- Verify `GEMINI_API_KEY` is set correctly
- Check API key is active in Google AI Studio

### Google OAuth Error
- Verify all three APIs are enabled (Calendar, Tasks, Gmail)
- Check redirect URI matches exactly in Google Cloud Console
- Ensure OAuth consent screen is configured
- For testing, add your email as a test user

### Token Refresh Error
- User may need to re-authorize if refresh token is invalid
- Check Firestore `userTokens` collection for stored tokens

## Security Notes

- Never commit `.env` or `serviceAccount.json` to version control
- Use environment variables in production
- Rotate API keys and secrets regularly
- Use HTTPS in production
- Implement rate limiting for production use


