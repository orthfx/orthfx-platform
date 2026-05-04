---
name: Orthodox Reader
description: A minimal, mobile-first Bible reading application featuring continuous scroll, synchronized audio narration, and a distraction-free reading experience.
github: https://github.com/orthfx/orthodox-reader
live: https://orthodox-reader.vercel.app
features:
  - Progressive Web App with offline support
  - Continuous reading from Genesis to Revelation
  - Red letter text for Jesus' words
  - Audio narration with synchronized highlighting
  - Dark/Light mode with customizable fonts
  - Reading position tracking
---

# Orthodox Reader

A minimal, mobile-first Bible reading application featuring continuous scroll, synchronized audio narration, and a distraction-free reading experience. Built with React, TypeScript, and Tailwind CSS.

## Overview

Orthodox Reader is a Progressive Web App designed to provide a beautiful, distraction-free Bible reading experience. The app is built with modern web technologies and optimized for both mobile and desktop use.

## Key Features

### Reading Experience
- **Progressive Web App**: Installable on mobile and desktop with offline support
- **Offline Reading**: Entire Bible text cached for reading without internet
- **Continuous Reading**: Infinite scroll from Genesis to Revelation - chapters load dynamically as you read
- **Red Letter Text**: Words of Jesus displayed in distinctive red color
- **Verse-by-Verse Layout**: Clean paragraph-per-verse format for easy reading and reference
- **Reading Position Tracking**: Automatically saves your place and offers "Continue Reading" on the home page

### Audio Features
- **Audio Narration**: Synchronized audio playback with real-time verse highlighting and auto-scroll tracking
- **Smart Audio Controls**: Auto-scroll follows audio playback, with "Resume Tracking" button when you scroll away
- **Persistent Audio Position**: Saves playback position and state across sessions

### Customization
- **Display Settings**: Toggle verse numbers, red letter text, book illustrations, headings, footnotes, and more
- **Font Options**: Choose from Serif, Modern Serif, Sans Serif, or Monospace
- **Dark/Light Mode**: System-aware theme switching with smooth transitions
- **Book Illustrations**: Visual separators between books with theme-adaptive cover images

### Navigation
- **Smart Navigation**: Dropdown navigation from header with testament tabs
- **Keyboard Navigation**: Use arrow keys to move between chapters
- **URL-based Routing**: Direct links to any chapter

## Tech Stack

- React 19 with TypeScript
- Vite for build tooling
- React Router v7 for navigation
- Tailwind CSS v4 for styling
- Radix UI for accessible components
- vite-plugin-pwa for Progressive Web App support
- Workbox for service worker and caching strategies
- Intersection Observer API for scroll tracking
- HTML5 Audio API for synchronized narration

## Current Status

- ✅ All 27 New Testament books available
- ✅ 41 Old Testament books available
- ✅ V2 JSON data format with annotation support
- ✅ Red letter text for Jesus' words
- 📖 Total: 1,202+ chapters available

## Links

- [GitHub Repository](https://github.com/orthfx/orthodox-reader)
- [Live Demo](https://orthodox-reader.vercel.app)
