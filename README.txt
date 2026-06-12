# How to Spawn Your Dragon

Mobile-first PWA version.

This version is built to feel more like an actual phone app instead of a desktop webpage.

## What changed

- Full-screen mobile app layout
- iPhone safe-area support
- App-style header
- Bottom tab navigation
- Separate screens for Check, Tracker, and Guide
- Larger touch-friendly buttons and inputs
- Less desktop spacing
- Better installed PWA behavior
- Bone OOF icon included in Apple/PWA sizes

## Main screens

### Check

Enter a chicken coordinate and tap **CHECK**.

The app shows:

- HIGH
- MAYBE
- LOW

It also shows the relative 50x50 position and saved observation details.

### Record & Log

After you hit a chicken, tap **RECORD & LOG**.

The pop-up asks:

**Did you spawn an Undead Dragon?**

Tap **YES** or **NO** and the app saves the observation.

### Tracker

Enter the wandering zombie start and finish coordinates.

Tap **NEXT LANDING POINT**.

The app projects the next point and automatically checks it.

### Guide

The short union explanation of how the method works.

## Install on iPhone

1. Open the hosted app link in Safari.
2. Tap Share.
3. Tap Add to Home Screen.
4. Open it from the home screen.

For the best app feel, it needs to be opened from the home screen after being installed.

## Install on Android

1. Open the hosted app link in Chrome.
2. Tap the install prompt or menu.
3. Tap Add to Home Screen / Install App.
4. Open it from the home screen.

## Files

- index.html
- styles.css
- app.js
- manifest.json
- sw.js
- icon files

2026 © PlatinumBoy

Splash screen update: added full-screen animated blood-drip loading screen with app icon, title, and loading bar.

Splash screen update v13: replaced CSS-only drips with an image-based Goosebumps-style horror blood splash background for thicker, glossier, more realistic slime/blood depth.

Splash screen update v14: removed blood/goop styling and replaced it with a clean black backdrop, soft white spotlight, glass card, and simple loading bar.

Icon cleanup v15: removed icon.svg completely and updated manifest/service worker to use PNG icons only.
