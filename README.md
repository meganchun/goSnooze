# goSnooze 

(👩🏻‍💻WIP) Your smart companion for stress-free commuting! goSnooze is a mobile app built with React Native and Expo Go that ensures GO Transit riders never miss their stop. Don't worry, go snooze 😉 and take that nap or focus without worrying about where you are.

## Features

- **📍 Location-Based Alerts:**
	•	Sends local buzz and notification alerts when approaching your selected destination.
	•	Uses Expo’s foreground and background location tracking for real-time updates.
	•	Customizable alert radius based on user preference.
- **🔒 Account Creation and Authentication:**
	•	Supabase Auth with OTP-based phone number verification.
	•	Email/password and Google authentication linked to the same user identity.
	•	Session persistence using Supabase's React Native client.
- **🗺 Real-Time Map Interface**
	•	Displays user’s live location alongside train routes and station markers.
	•	Uses animated markers to reflect movement and current status.
	•	Built using react-native-maps and React Native’s animation APIs.

## Tech Stack
- Frontend: React Native, NativeWind, Expo Go
- Backend/Services: Supabase Auth, Postgres, Storage, and Edge Functions
- APIs & Libraries: Expo Location API, Expo Notifications, React Native Maps

## Backend setup

Follow [supabase/README.md](supabase/README.md) to create a Supabase project,
apply the committed migration, configure phone/email/Google providers, and add
only the public Expo configuration values to `.env`. SMS, push, and service-role
credentials must remain in Supabase configuration or Edge Function secrets.

![User Management Flow](https://github.com/user-attachments/assets/10bae33e-0a41-4389-96e7-e01ccb2b37c7)
![Home Screen Flow](https://github.com/user-attachments/assets/4f420a78-ba88-4f05-a398-da7f71898a47)
