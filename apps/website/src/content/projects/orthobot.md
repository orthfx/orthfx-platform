---
name: Orthobot
description: A Discord bot that posts Bible passages when referenced in chat. Simply type a reference like "John 3:16" and the bot will respond with the verse.
github: https://github.com/orthfx/orthobot
features:
  - Automatic Bible verse lookup
  - Support for multiple reference formats
  - Range of verses and chapters
  - Multiple references in one message
---

# Orthobot

A Discord bot that posts ESV Bible passages when referenced in chat. NKJV with full Orthodox canon coming soon.

## Overview

Orthobot makes it easy to share Bible verses in Discord servers. Simply type a Bible reference in your message, and the bot will automatically respond with the verse text.

## Usage

Orthobot supports multiple reference formats:

### 1. Specific Reference
```
Gen 1:1
```
Posts Genesis 1:1

### 2. Whole Chapter
```
Gen 1
```
Posts the entire chapter of Genesis 1

### 3. Range of Chapters
```
Gen 1-2
```
Posts Genesis chapters 1 and 2

### 4. Range of Verses Within a Chapter
```
Gen 1:1-3
```
Posts Genesis 1:1-3

### 5. Range of Verses Crossing Chapters
```
Gen 1:1-2:3
```
Posts from Genesis 1:1 through 2:3

### Multiple References
You can provide multiple references by separating them with semicolons:
```
Gen 1-2; John 3:16
```

## Setup Instructions

### Step 1: Prerequisites
- Download and install Node.js from [nodejs.org](https://nodejs.org)
- Create a Discord account and server

### Step 2: Create Discord Application
1. Go to [Discord Developer Portal](https://discordapp.com/developers/applications/me)
2. Click "New Application" and name your bot
3. Navigate to "Bot" section and click "Add Bot"
4. Copy the bot's authorization token

### Step 3: Configure Bot
Create an `auth.json` file in the root directory:
```json
{
  "token": "YOUR_BOTS_AUTH_TOKEN"
}
```

### Step 4: Invite Bot to Server
Use your Client ID to create an invite URL:
```
https://discordapp.com/oauth2/authorize?&client_id=CLIENTID&scope=bot&permissions=8
```

### Step 5: Install and Run
```bash
npm install
node bot.js
```

## Roadmap

- [ ] Multiple translation support (NKJV, ESV, etc.)
- [ ] Slash commands
- [ ] Church Father quotes
- [ ] Glossary of Orthodox terms

## Links

- [GitHub Repository](https://github.com/orthfx/orthobot)
