# Voice Audit - Frontend

A modern voice audit web application built with Vite, React, and TypeScript. Users can record voice commands and interact with an AI-powered assistant.

## Features

### 🏠 Landing Page
- Scrollable landing page with glass morphism effects
- Smooth transitions and hover effects
- Dark theme with white text
- "Get Started" button redirects to authentication

### 🔐 Authentication Page
- Sign In and Sign Up functionality
- Google authentication option
- Minimal and unique design
- Smooth transitions and interactive hover effects
- Redirects to chat section after authentication

### 💬 Chat Section
- Voice command recording using browser's MediaRecorder API
- Chat-type interface with message history
- Side navbar with:
  - Chat history (previous conversations)
  - Account details menu at bottom left
- Real-time message display with timestamps

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Navigation and routing

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── pages/
│   ├── LandingPage.tsx      # Landing page component
│   ├── LandingPage.css      # Landing page styles
│   ├── AuthPage.tsx         # Authentication page component
│   ├── AuthPage.css         # Authentication page styles
│   ├── ChatPage.tsx         # Chat interface component
│   └── ChatPage.css         # Chat page styles
├── App.tsx                  # Main app component with routing
├── App.css                  # App-level styles
├── main.tsx                 # Entry point
└── index.css                # Global styles
```

## Design Principles

- **Dark Theme**: Consistent dark background (#0a0a0a) with white text
- **Glass Morphism**: Cards use backdrop-filter blur effects
- **No Gradients**: Solid colors only, no gradient backgrounds
- **Smooth Transitions**: All interactive elements have transition effects
- **Hover Effects**: Enhanced interactivity with hover states

## Browser Compatibility

- Modern browsers with MediaRecorder API support
- Chrome, Firefox, Edge (latest versions)
- Microphone permissions required for voice recording

## Notes

- Voice recording requires browser microphone permissions
- Authentication is currently simulated (ready for backend integration)
- Chat history is stored in component state (consider adding persistence)
