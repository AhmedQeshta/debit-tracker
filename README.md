# 🚀 DebitTracker

**DebitTracker** is a premium, offline-first mobile application built with React Native and Expo. It allows users to track personal debts, transactions, and balances with a seamless user experience, even without an internet connection.

## ✨ Features

- 📱 **Offline-First Architecture**: Perform all CRUD actions offline; data syncs automatically in the background when a connection is restored.
- 🌓 **Premium Dark Mode**: A sleek, high-contrast dark interface designed for modern mobile users.
- 👥 **User Management**: Add, search, and manage a list of regular contacts/users.
- 💸 **Transaction Tracking**: Easy-to-use transaction entry with a sign toggle (+ / -) to distinguish between money owed and money borrowed.
- 📊 **Dashboard & Analytics**: Global stats including total users, pending syncs, and aggregate debt balance.
- 🔗 **Deep Linking & Navigation**: Built on **Expo Router** for robust file-based navigation.
- 🧠 **Persistent State**: Powered by **Zustand** and **AsyncStorage** for fast, reliable data persistence.

## 🛠️ Tech Stack

- **Framework**: Expo (SDK 54)
- **Navigation**: Expo Router
- **State Management**: Zustand (with Persist middleware)
- **Persistence**: @react-native-async-storage/async-storage
- **Network Stats**: @react-native-community/netinfo
- **Styling**: React Native StyleSheet (with a centralized theme system)
- **Icons**: Lucide React Native

## 📂 Project Structure

```text
app/                 # Expo Router file-based screens
components/          # Reusable UI components (Button, Input, etc.)
store/              # Zustand stores for users, transactions, and sync
services/           # Sync engine, Network monitoring, and Storage services
theme/              # Centralized color palette and spacing tokens
types/              # TypeScript model definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Expo Go app on your mobile device (for testing)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd debit-tracker
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the project:

   ```bash
   npm start
   ```

4. Open on your device:
   - Scan the QR code with the **Expo Go** app (Android) or Camera (iOS).
   - Press `a` for Android Emulator or `i` for iOS Simulator.

## 🔄 Sync Engine Logic

The app uses a robust background sync pattern:

1. **Action Queue**: Every create/update/delete action is added to a persistent `SyncQueue` if offline.
2. **Connectivity Listener**: `NetInfo` monitors network changes.
3. **Automatic Re-sync**: When the connection is restored, the `SyncQueue` is processed sequentially, updating local records as `synced = true` upon success.
