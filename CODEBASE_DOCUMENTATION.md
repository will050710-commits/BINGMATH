# DuoMath Codebase & Structure Documentation

Welcome to the documentation for **DuoMath**! This guide is written in clear, understandable language to help you navigate, understand, and build upon the code structure of your project.

---

## 📂 Project Directory Structure

DuoMath is structured as a **bilingual web application** consisting of a React-based frontend (using Next.js) and a lightweight Python backend (using Flask).

```
duosteam/
├── backend/                  # Python API server
│   ├── main.py               # FastAPI alternative (production setup)
│   ├── server.py             # Active Flask API server (manages DB, AI, and Auth)
│   ├── requirements.txt      # Python dependencies (Flask, JWT, requests, etc.)
│   └── duomath.db            # SQLite database file containing user & score records
│
└── frontend/                 # Next.js client application
    ├── HeroProvider.js       # HeroUI (formerly NextUI) styles wrapper
    ├── package.json          # Node dependencies (Next.js v16, React v19, TailwindCSS, etc.)
    └── src/
        ├── app/              # Routing system (Page shells loading components)
        │   ├── layout.js     # Root layout wrapping the app in context providers
        │   ├── page.js       # Entry page rendering the TrangChuForm
        │   ├── pagebailam.js # Entrance to SAT/IELTS math examinations
        │   └── Lesson*/      # Page routes for each individual math lesson
        │
        ├── components/       # Core UI implementation components
        │   ├── trangchu/     # Home page dashboard (TrangChuForm.js)
        │   ├── authentication/# Login & Registration forms
        │   ├── Cacbaitoan10/ # Interactive Math Lessons (Lessons 1-36 + LessonVideoPlayer)
        │   ├── DuoMCB/       # AI Chatbot & Translation panel (DuoMCBPage & DuoTranslate)
        │   └── bailam/       # Exam testing sections & forms
        │
        ├── context/          # Global application state managers
        │   └── authContext.js# Manages token persistence, user profile, and score stashing
        │
        └── utils/            # Logic & validation helpers
            ├── testTimer.js  # Live session countdown clock managers
            ├── scoring.js    # Grade calculator and mastery level evaluator
            └── answerKey.js  # Answer keys for exams
```

---

## 🛠️ Core Features & Functions

### 1. User Authentication & Profile Context (`authContext.js`)
*   **Purpose**: Manages user registrations, logins, auto-refresh tokens on authorization failures, and profile updates.
*   **Persistent Storage**: Access token (`dm_access`) and Refresh token (`dm_refresh`) are stored in `localStorage` to keep the user signed in across reloads.
*   **Functions**:
    *   `login({ email, password })`: Validates user credentials with backend, saves authorization tokens, and downloads user data.
    *   `signup({ ... })`: Creates a new account, automatically logs the user in, and initializes empty scores.
    *   `logout()`: Deletes stored tokens and clears user details.
    *   `updateProfile(fields)`: Updates user particulars (e.g., School, Grade, Phone) in the database.
    *   `saveTestResult(result)`: Sends newly graded test scores to the backend database.
    *   `saveGameResult(result)`: Sends mini-game statistics to the database.
    *   `loadProfile()`: Fetches the authenticated user's current progress, average scores, and best rankings on application startup.
*   **Hooks Used**:
    *   `useState(user)`: Holds the active user profile object or `null` if unauthenticated.
    *   `useState(ready)`: Boolean indicating whether the application has finished checks for a pre-existing login token.
    *   `useState(testResults)` / `useState(gameResults)`: Arrays tracking scores achieved by the user.
    *   `useCallback(loadProfile)`: Memoizes the profile-fetching function to prevent unnecessary component renders.
    *   `useEffect(() => { loadProfile(); }, [loadProfile])`: Runs once when the application starts up to automatically log in returning users.

### 2. Main Dashboard (`TrangChuForm.js`)
*   **Purpose**: Renders the homepage layout, quick-start guide navigation modal, test selectors, and the community leaderboard.
*   **Functions**:
    *   `fetchLeaderboard()`: Calls `/api/leaderboard` on the backend to fetch the top 20 users ranked by accumulated scores.
    *   `handleSignOut()`: Clears active login credentials and redirects the user to the splash screen.
*   **Hooks Used**:
    *   `useAuth()`: Extracted custom React hook providing details of the current user.
    *   `useRouter()`: Next.js router used to navigate between views.
    *   `useState(showFlyer)`: Controls the visibility of the "Quick Instructions Guide" dropdown.
    *   `useState(showProfile)`: Handles the opening/closing of the profile dropdown statistics.
    *   `useState(leaderboard)`: Stores the array of top-ranked student scores.
    *   `useState(lbLoading)`: Controls loading spinner displays for the leaderboard.
    *   `useCallback(fetchLeaderboard)`: Optimizes data fetching to avoid redundant HTTP requests.
    *   `useEffect(fetchLeaderboard)`: Fetches leaderboard data as soon as the homepage loads.
    *   `useEffect(revealAnimations)`: Initialises an `IntersectionObserver` on elements marked `[data-reveal]` to fade components in smoothly as the user scrolls.
    *   `useEffect(mousedownListener)`: Adds a global listener to close the instructions or profile dropdown when the user clicks anywhere outside of them.

### 3. Interactive Bilingual Lessons (e.g., `Lesson1_MenhDe.js`)
*   **Purpose**: Renders chapter materials with language switches, clickable video lectures, practice exercises, and 3 types of mini-games.
*   **Bilingual Toggle**: Toggles all mathematical text on the fly between Vietnamese (🇻🇳) and English (🇬🇧) using a local key translator function `t(vietnamese, english)`.
*   **Mini-Games**:
    1.  *Multiple Choice (mc)*: Increments score and saves histories.
    2.  *True/False (tf)*: Flips question cards and reveals correct feedback responses.
    3.  *Fill in Blank (fill)*: Sanitizes input (removing whitespaces and capitalizations) to match answer values.
*   **Hooks Used**:
    *   `useState(lang)`: Holds the active language string (`"vi"` or `"en"`).
    *   `useState(revealedAnswers)`: Tracks which exercise solution cards have been clicked open.
    *   `useState(gameMode)`: Stores which mini-game (Multiple Choice, True/False, or Fill-in-Blank) is active.
    *   `useState(mcIndex / mcSelected / mcScore / mcHistory)`: Controls navigation index, user choice, accumulated correct score, and performance summaries in Multiple Choice.
    *   `useState(tfIndex / tfFlipped / tfScore / tfHistory)`: Manages card index, flip states, and performance trackers for the True/False card stack.
    *   `useState(fillAnswers / fillChecked)`: Tracks user text inputs and submission grading indicators.
    *   `useEffect()`: Installs scroll-activated elements fade-ins using `IntersectionObserver`.

### 4. Interactive Video Player (`LessonVideoPlayer.js`)
*   **Purpose**: Displays educational videos with synchronized English transcripts. Clicking any transcript word pauses the video and opens a sidebar detailing definitions and translations.
*   **Functions**:
    *   `handleWordClick(word)`: Gathers word meta-information and loads it into the details sidebar panel.
*   **Hooks Used**:
    *   `useState(currentTime)`: Tracks the active time duration of the video.
    *   `useState(playerReady)`: Tracks whether the YouTube IFrame API has loaded.
    *   `useState(isPlaying)`: Detects if the video is currently playing.
    *   `useState(sidebar)`: An object storing sidebar details: `{ open, title, detail, vi }`.
    *   `useRef(iframeRef)`: Anchors the YouTube `<iframe>` HTML element.
    *   `useRef(playerRef)`: Stores the instanced YouTube `YT.Player` controller object.
    *   `useRef(timerRef)`: Holds the `setInterval` instance that checks the video playback time.
    *   `useCallback(handleWordClick)`: Prevents unnecessary rerenders of the interactive subtitle words.
    *   `useEffect(apiLoader)`: Injects the YouTube IFrame API script tag into the document header on page load, initializes the video frame, and disposes of the player when navigating away.
    *   `useEffect(timePoller)`: Fires a time-polling checker every `250ms` while the video is playing to sync subtitles.

### 5. DuoTranslate selection translator (`DuoTranslate.js`)
*   **Purpose**: Listens to mouse selections on lesson screens. When a user highlights English mathematical text, it prompts the AI backend to translate it and display details in a slide-out panel.
*   **Functions**:
    *   `initSession()`: Requests a translation workspace ID from the server.
    *   `handleMouseDown(e)` / `handleMouseUp(e)`: Registers mouse coords and targets to determine if a selection event occurred.
    *   `doTranslate(text)`: Posts text selections to the server.
*   **Hooks Used**:
    *   `useState(isOpen)`: Dictates whether the slide-out translation panel is open.
    *   `useState(selectedText)`: Stores the raw English text selection snippet.
    *   `useState(results)`: Stores translations, definitions, parts of speech, and usage examples.
    *   `useState(loading)`: Displays a loading indicator while fetching translation results.
    *   `useState(sessionId)`: Keeps track of the API conversation workspace session.
    *   `useRef(panelRef)`: Points to the translator panel element to prevent text selections within the panel from triggering loops.
    *   `useRef(lastTranslatedRef)`: Caches the last processed phrase to avoid redundant API hits.
    *   `useRef(debounceRef)`: Debounces text selection handlers.
    *   `useRef(mouseDownRef)`: Registers initial click coordinates to prevent translations on simple clicks.
    *   `useCallback(handlers)`: Optimizes pointer event handlers.
    *   `useEffect(listeners)`: Binds click handlers to the global browser document and disposes of them on cleanup.

### 6. DuoMCB AI Chatbot (`DuoMCBPage.js`)
*   **Purpose**: Main chatbot interface. Users can enter math queries or upload images of math problems to receive hints or step-by-step solutions in both languages.
*   **AI Integration**: Utilizes Llama-3.1-8b-instant for conversational text and Llama-4-Scout-17b for image input queries via the Groq Cloud API.
*   **Hooks Used**:
    *   `useState(messages)`: An array storing the message log list (`{ role, content, image, id }`).
    *   `useState(input)`: Tracks what the user is typing in the input textarea.
    *   `useState(loading)`: Handles the typing bubbles indicator while waiting for the AI response.
    *   `useState(sessionId)`: Tracks session IDs for conversation persistence.
    *   `useState(sidebarOpen)`: Manages slide-out chat histories sidebar visibility.
    *   `useState(imagePreview)` / `useState(imageBase64)`: Stores uploaded image sources for UI preview and base64 strings for backend requests.
    *   `useState(showImageModal)`: Controls visibility of the confirmation modal where users choose between "Hints" or "Full Solution".
    *   `useRef(bottomRef)`: References an anchor div at the bottom of the chat window.
    *   `useRef(inputRef)`: Directs input focus control to the message input field.
    *   `useRef(fileInputRef)`: Injects clicks to the hidden HTML file upload input.
    *   `useEffect(scroller)`: Scrolls the chat view down automatically when a new message is sent or received.

### 7. Examination System (`pagebailam.js`)
*   **Purpose**: Manages multi-section exams (SAT Reading, IELTS T/F/NG, and Written Math) within a strict 60-minute countdown session.
*   **Functions**:
    *   `saveAnswer(questionId, value)`: Saves user selections to the state and stashes them in `localStorage`.
*   **Hooks Used**:
    *   `useRouter()`: Used to redirect students to the final results screen once the exam is submitted or time runs out.
    *   `useState(time)`: Holds the remaining timer clock string (formatted as `HH:MM:SS`).
    *   `useState(answers)`: Stores key-value pairings of user exam choices.
    *   `useEffect(examCore)`: 
        *   Loads stashed answers from `localStorage` for the active section.
        *   Initializes the countdown timer via the `startTimer` utility.
        *   Sets up a 1-second interval loop to tick down and redirect the student to the grading page `/ketqua` when time reaches zero.
        *   Clears the loop interval on component unmount.

---

## 🐍 Backend Route Breakdown (`server.py`)

The Flask server handles database operations, authentication security, and communicates with AI models:

| Route | Method | Description |
| :--- | :--- | :--- |
| `/api/signup` | **POST** | Checks for existing emails, hashes passwords, creates a new user row, and returns JWT Access + Refresh tokens. |
| `/api/login` | **POST** | Verifies password hashes and returns user statistics alongside JWT tokens. |
| `/api/refresh` | **POST** | Uses refresh tokens to issue new temporary access tokens, preventing users from logging out. |
| `/api/me` | **GET** | Fetches the logged-in user's profile details and score histories. |
| `/api/me` | **PATCH** | Updates details such as school name, grade level, and telephone number. |
| `/api/test-result` | **POST** | Records graded test records, time spent, and exact question response sheets. |
| `/api/minigame-result`| **POST** | Saves individual math mini-game scores. |
| `/api/leaderboard` | **GET** | Aggregates all user scores from the database by identifying their best attempt for each exam section, sums them up, and lists the top 20 players. |
| `/api/chat` | **POST** | Relays questions to Groq LLMs. Parses base64 images if present, utilizing Llama-4-Scout-17b to process vision prompts. |
| `/api/translate` | **POST** | Sends highlighted English text to Llama-3.1-8b with instructions to return a structured translation JSON object. |
| `/api/health` | **GET** | Tests the SQLite database connection latency and checks backend API status. |

---

## 💡 Quick Code Flow Summary

1.  **Mounting**: Next.js initializes components using page shells in `src/app/` which import components from `src/components/`. The app is wrapped in `AuthProvider` which reads the tokens from `localStorage` and logs in returning users.
2.  **Navigation**: The homepage (`TrangChuForm.js`) displays lesson progress and the leaderboard fetched from `/api/leaderboard`.
3.  **Bilingual Lesson Loops**: Clicking a lesson loads components (e.g. `Lesson1_MenhDe.js`) wrapped in `DuoTranslate.js`. Toggling 🇻🇳/🇬🇧 rerenders page components using translation keys. Highlighting text opens the translator panel, query strings are sent to `/api/translate`, and translation objects are displayed.
4.  **Testing**: Clicking an exam loads `pagebailam.js`. An interval timer reads time limits from `localStorage`. Transitioning sections stashes answers in `localStorage`. Completing tests sends them to `/api/test-result`, which calls `/api/me` to update local statistics.
