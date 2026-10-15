# Setting up accounts and leaderboards (Firebase)

This takes about 10 minutes. You only do it once. When you're done, send the config from step 2 to Claude, and Claude will put it in `firebase-config.js`.

## 1. Create a Firebase project

1. Go to https://console.firebase.google.com and sign in with a Google account.
2. Click **Create a project** (or **Add project**).
3. Give it a name, for example `spellbound-arcade`. Click **Continue**.
4. Google Analytics isn't needed, so you can switch it off. Click **Create project**, then **Continue**.

## 2. Add a web app and copy its config

1. On the project's home page, click the **web icon** (it looks like `</>`).
2. Give the app a nickname, for example `Spellbound`. Leave "Firebase Hosting" unticked for now. Click **Register app**.
3. Firebase shows some code containing `const firebaseConfig = { ... }`. **Copy everything between the curly brackets**, including `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId` and `appId`.
4. **Send that config to Claude.** (It's safe to share: these values identify your project but don't give anyone access to it. The security rules in step 4 protect your data.)

## 3. Turn on username + password sign-in

1. In the left menu, open **Build → Authentication** and click **Get started**.
2. On the **Sign-in method** tab, click **Email/Password**.
3. Switch on the first toggle (**Email/Password**) and click **Save**.

The game turns usernames into private stand-in email addresses behind the scenes, so players never need a real email address. This also means there's no "forgot password" email. If a player forgets their password, they make a new account.

## 4. Create the database for the leaderboards

1. In the left menu, open **Build → Firestore Database** and click **Create database**.
2. Choose a location near you (for example `eur3 (europe-west)`) and click **Next**.
3. Choose **Start in production mode** and click **Create**.
4. Open the **Rules** tab, delete everything there, paste the rules below, and click **Publish**.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedInAs(uid) {
      return request.auth != null && request.auth.uid == uid;
    }

    // Each player: username + all-time points. Anyone can read (for the leaderboards).
    match /players/{uid} {
      allow read: if true;
      allow create: if signedInAs(uid)
        && request.resource.data.keys().hasOnly(['username', 'created', 'total'])
        && request.resource.data.username is string
        && request.resource.data.username.matches('^[A-Za-z0-9_]{3,16}$')
        && request.resource.data.total == 0;
      // Players can only add points to their own total: never lower it, never change their username.
      allow update: if signedInAs(uid)
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['total'])
        && request.resource.data.total is int
        && request.resource.data.total > resource.data.get('total', 0)
        && request.resource.data.total - resource.data.get('total', 0) <= 50000;
    }

    // Best score per player for each game and difficulty, e.g. boards/snake~1/scores/{uid}.
    match /boards/{board}/scores/{uid} {
      allow read: if true;
      allow create, update: if signedInAs(uid)
        && request.resource.data.keys().hasOnly(['username', 'score', 'at'])
        && request.resource.data.score is int
        && request.resource.data.score >= 0
        && request.resource.data.score <= 50000
        && request.resource.data.username == get(/databases/$(database)/documents/players/$(uid)).data.username;
    }
  }
}
```

## 5. Put the game online

The claude.ai link **can't** connect to Firebase, because claude.ai blocks pages from talking to outside services. Accounts only work on a copy of the game hosted on the web. Two free options:

**Option A: Firebase Hosting (everything stays in Firebase)**
1. Install Node.js from https://nodejs.org (the LTS version).
2. Open a terminal in the `Spelling game` folder and run these one at a time:
   - `npm install -g firebase-tools`
   - `firebase login`
   - `firebase init hosting`. Pick your project. When it asks for the public directory, type `.` (a full stop). Answer **No** to "single-page app" and **No** to GitHub.
   - `firebase deploy`
3. It prints a link like `https://spellbound-arcade.web.app`. That's your game. Firebase Hosting addresses are already allowed to log in.

**Option B: Netlify Drop (no installing)**
1. Go to https://app.netlify.com/drop and drag the whole `Spelling game` folder onto the page.
2. Make a free Netlify account when asked, so the site stays online.
3. Copy your site address (for example `https://bright-owl-123.netlify.app`).
4. In Firebase, open **Authentication → Settings → Authorized domains**, click **Add domain**, and paste just the address part (`bright-owl-123.netlify.app`).

Whenever the game is updated, upload the folder again (run `firebase deploy` again, or drag the folder onto Netlify Drop again).

## What players will see

- **Log in** and **Sign up** buttons at the top of the page.
- Usernames: 3–16 letters, numbers or `_`. Passwords: at least 6 characters.
- Your **all-time points** always show at the top of the page. Tap them to see the **all-time leaderboard** (top 20 players by total points).
- Each game has its own top 10 for **Easy, Medium and Hard**, shown in the game's menu.
- When a logged-in player finishes a round, their score is saved if it beats their best, and the leaderboard appears on the results screen.
