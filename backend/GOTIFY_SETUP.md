# Gotify Setup Guide

Gotify is a self-hosted push notification server. This app uses it to send price-drop alerts to your phone.

---

## 1. Run the Gotify Server

The easiest way is Docker. Pick any port — 9090 is used here to avoid collisions.

```bash
docker run -d \
  --name gotify \
  --restart unless-stopped \
  -p 9090:80 \
  -v /var/gotify/data:/app/data \
  gotify/server
```

The server is now running at `http://localhost:9090`.

> **Want it accessible from your phone on the same network?**
> Replace `localhost` with your machine's local IP (e.g. `http://192.168.1.100:9090`).
> You can find your IP with `ipconfig` (Windows) or `ip addr` (Linux/Mac).

---

## 2. First Login & Change Password

1. Open `http://localhost:9090` in a browser.
2. Log in with the default credentials: **username** `admin`, **password** `admin`.
3. Go to **Users** → click your user → change the password immediately.

---

## 3. Create an Application (get your App Token)

Applications are how Gotify scopes push tokens — one app, one token.

1. In the sidebar, click **Apps**.
2. Click **Create Application**.
3. Give it a name: `P2P Journal` (the icon is optional).
4. Click **Create**.
5. The app card now shows a token — click the eye icon to reveal it. **Copy this token.**

This is your `GOTIFY_APP_TOKEN`.

---

## 4. Set Environment Variables

In `backend/.env`:

```env
GOTIFY_URL=http://localhost:9090
GOTIFY_APP_TOKEN=<paste token here>
```

If your Gotify server is on a different machine or exposed via a public URL, replace `localhost:9090` with that address.

---

## 5. Install the Gotify App on Your Phone

**Android**
- Download from [F-Droid](https://f-droid.org/packages/com.github.gotify/) or the [GitHub releases page](https://github.com/gotify/android/releases).
- Open the app → tap **+** → enter your server URL and login credentials.
- Notifications will now appear on your device whenever the server pushes a message.

**iOS**
- Gotify does not have an official iOS client.
- Alternative: use **Ntfy** (`ntfy.sh`) — it has an iOS app. If you want to switch to Ntfy, the only change needed is in `gotify_service.py` (different HTTP endpoint format).

---

## 6. Verify It Works

Send a test notification from the terminal:

```bash
curl -X POST "http://localhost:9090/message?token=<your_app_token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "message": "Gotify is working!", "priority": 7}'
```

You should see the notification appear in the Gotify web UI and on your phone within seconds.

---

## 7. How the Alert Works in This App

- The backend runs a background loop that fetches the p2p.me buy price every **60 seconds**.
- If `buy_price < your_threshold`, a notification is sent.
- Alerts repeat every **5 minutes** while the price stays below the threshold.
- Setting the threshold to `null` (clearing it in the UI) disables alerts entirely.

Configure your threshold from the **Alert Panel** on the dashboard.

---

## Priority Reference

| Priority | Behavior |
|---|---|
| 1–3 | Low — silent, no vibration |
| 4–7 | Normal — standard notification |
| 8–10 | High — vibrates even in Do Not Disturb (Android) |

The app sends priority **7** for price alerts.
