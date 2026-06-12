# How to Spawn Your Dragon

A compact overlay-style PWA for tracking chicken coordinates, predicting dragon-leaning spots, and projecting the next landing point from wandering zombie movement paths.

Created for [OOF] OrganizedChaos.

2026 © PlatinumBoy

---

## What this app does

This app helps you avoid wasting stamina by checking whether a chicken coordinate is likely to spawn an Undead Dragon.

It works by comparing the coordinate you enter against saved observations:

- chickens that spawned an Undead Dragon
- chickens that did not spawn an Undead Dragon

The app does not treat any coordinate as guaranteed forever, because chicken spawns reset every hour. Instead, it gives a probability-style result:

- **HIGH** = strong dragon-leaning spot
- **MAYBE** = possible, but not the first choice
- **LOW** = probably skip and save stamina

---

## Main buttons

### CHECK

Enter a chicken coordinate in the X and Y boxes, then press **CHECK**.

The app will show:

- the relative position inside the 50x50 square
- the dragon-leaning probability
- the nearest known dragon result
- the nearest known no-dragon result
- total saved observations

### RECORD & LOG

Use this after you actually hit a chicken.

When you press **RECORD & LOG**, a pop-up asks:

**Did you spawn an Undead Dragon?**

Choose:

- **YES** if the chicken spawned an Undead Dragon
- **NO** if the chicken did not spawn one

The app saves that observation automatically and uses it to improve future predictions.

---

## Dragon Tracker

The **Dragon Tracker** helps project the next landing point from a wandering zombie path.

Use it when you know where a wandering zombie started and where it stopped.

Enter:

- Start X
- Start Y
- Finish X
- Finish Y

Then press **NEXT LANDING POINT**.

The app calculates the same direction and distance again, starting from the finish point.

Example:

```text
Start: 476,760
Finish: 457,705

Direction:
x -19
y -55

Next landing point:
438,650
```

The app will also automatically check that next landing point as a chicken coordinate and tell you whether it looks HIGH, MAYBE, or LOW.

---

## How to use the method in-game

1. Find a wandering overlord zombie.
2. Watch where it starts and where it stops.
3. Wait for it to fully stop and choose its next route.
4. Follow the new path it takes.
5. Hit the first chicken on that path.

That first chicken is the one most likely to spawn an Undead Dragon.

The tracker is helpful, but you do not need it to understand the method. The simple rule is:

```text
Zombie stops -> zombie picks a new direction -> follow that line -> first chicken = dragon chance
```

---

## If it is not working

If the method is not working in your area:

- wait until the next chicken spawn reset
- move to a fresh area
- the current area may have already been farmed by someone else
- regroup, wait for the new set of chickens, and continue

Chicken spawns reset every hour, so a spot that worked once should not be treated as guaranteed forever.

---

## Saved data

The app saves observations in the browser using localStorage.

That means:

- data stays on the device/browser where it was entered
- each player’s app learns from their own logged results
- clearing browser data may erase saved observations
- different people will not automatically share the same observation data unless the app is updated with shared seed data later

---

## PWA installation

Once hosted on GitHub Pages, Netlify, Cloudflare Pages, or another static web host, users can open the link and install it like an app.

On desktop:

1. Open the hosted app link.
2. Use the browser install option.
3. Pin it or open it as a small window.

On mobile:

1. Open the hosted app link.
2. Use “Add to Home Screen” or the browser install option.
3. Open it like a normal app.

---

## Files included

```text
index.html      main app layout
styles.css      visual styling
app.js          prediction logic and tracker
manifest.json   PWA app settings
sw.js           offline service worker
icon.svg        app icon
README.txt      this guide
```

---

## Notes

This is a probability helper, not a guaranteed detector.

The more dragon and no-dragon results you log, the better the app becomes at identifying the strongest chicken zones.
