![image](https://github.com/user-attachments/assets/eb4a3b50-dc4e-411e-bd10-3b157ca122da)# Habidot: Accountability-as-a-Service

![image](https://github.com/user-attachments/assets/2ee01f17-0cf2-45f9-be39-d33ebdbd5184)


<div align="center">
  
  <h3>Transform your habits with financial incentives</h3>
  
  [![Expo](https://img.shields.io/badge/Expo-v50.0-blue.svg)](https://expo.dev/)
  [![React Native](https://img.shields.io/badge/React%20Native-v0.73.6-blue.svg)](https://reactnative.dev/)
  [![Solana](https://img.shields.io/badge/Solana-Blockchain-green.svg)](https://solana.com/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
</div>

## 🚀 Overview

Habidot is a cutting-edge mobile application that revolutionizes personal accountability through financial incentives. By allowing users to stake cryptocurrency on their fitness goals, Habidot creates a powerful motivation system where completing your goals means earning rewards from those who don't follow through.

### Core Features

- **Goal-Based Financial Pooling:** Join challenges by contributing a fixed amount (e.g., $300)
- **Automated Progress Tracking:** Integration with Google Fit, Apple Health, and Fitbit
- **Financial Incentives:** Successful participants get their money back plus a share of forfeited funds
- **Gamification:** Real-time leaderboards, progress tracking, and achievement badges
- **Social Challenges:** Create private groups with friends or join public challenges

## 📱 Demo Videos : 
1) https://drive.google.com/file/d/1UPME6JjnekMaxbzP9lZQyvaGnC58OVU3/view?usp=drive_link

2) https://drive.google.com/file/d/1UPME6JjnekMaxbzP9lZQyvaGnC58OVU3/view?usp=drive_link

<div align="center">
  <p float="left">
    <img src="https://via.placeholder.com/180x320.png?text=Dashboard" width="200" />
    <img src="https://via.placeholder.com/180x320.png?text=Challenge" width="200" /> 
    <img src="https://via.placeholder.com/180x320.png?text=Leaderboard" width="200" />
  </p>
</div>

## 🛠️ Technology Stack

- **Frontend:** React Native with Expo
- **Styling:** TailwindCSS (NativeWind)
- **Authentication:** Google Sign-In
- **Blockchain:** Solana Mobile Wallet Adapter
- **Health Tracking:** React Native Health (Apple HealthKit), Google Fit
- **Navigation:** React Navigation
- **State Management:** React Context API and AsyncStorage

## 🔧 Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/) (v8 or later) or [Yarn](https://yarnpkg.com/) (v1.22 or later)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Android Studio](https://developer.android.com/studio) (for Android development)
- [Xcode](https://developer.apple.com/xcode/) (for iOS development, macOS only)
- Solana Wallet App (for testing blockchain features)

### Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/habidot.git
cd habidot
```

2. **Install dependencies**

```bash
# Using npm
npm install

# OR using Yarn
yarn install
```

3. **Configure Google Sign-In**

For Android:
- Create a project in [Firebase Console](https://console.firebase.google.com/)
- Add your Android app to the project
- Download the `google-services.json` file and place it in the `android/app` directory

For iOS:
- Configure your `Info.plist` with the required Google Sign-In keys

4. **Configure Solana**

- Create a `.env` file and add your Solana RPC URL:

```
SOLANA_RPC_URL=your_solana_rpc_url
```

5. **Start the development server**

```bash
# Start Expo development server
npm start
```

6. **Run the application**

```bash
# For iOS
npm run ios

# For Android
npm run android
```

You can also scan the QR code with the Expo Go app on your device to run the app directly.

## 📁 Project Structure

Based on the file structure in your screenshots:

```
habidot/
├── .idea/                 # IDE settings
├── .vscode/               # VS Code settings
├── %ProgramData%/         # Program data files
├── android/               # Android native code
│   ├── app/               # Android app code
│   ├── gradle/            # Gradle configuration
│   ├── .gitignore         # Git ignore rules
│   ├── build.gradle       # Gradle build configuration
│   ├── gradle.properties  # Gradle properties
│   ├── gradlew            # Gradle wrapper script
│   ├── gradlew.bat        # Gradle wrapper batch script
│   ├── settings.gradle    # Gradle settings
├── ios/                   # iOS native code
│   ├── Catoff/            # iOS app code
│   ├── Catoff.xcodeproj/  # Xcode project
│   ├── Catoff.xcworkspace/# Xcode workspace
│   ├── .gitignore         # Git ignore rules
│   ├── .xcode.env         # Xcode environment
│   ├── Podfile            # CocoaPods dependencies
│   ├── Podfile.lock       # CocoaPods lock file
├── src/                   # Source code
├── assets/                # App assets
├── .gitignore             # Git ignore rules
├── App.js                 # Main app component
├── app.json               # Expo configuration
├── AppNavigator.js        # Navigation configuration
├── babel.config.js        # Babel configuration
├── credentials.json       # API credentials (not in repo)
├── eas.json               # Expo Application Services config
├── index.js               # Entry point
├── metro.config.js        # Metro bundler configuration
├── package.json           # Project dependencies
├── package-lock.json      # Dependency lock file
├── README.md              # Project documentation
├── tailwind.config.js     # TailwindCSS configuration
├── tsconfig.json          # TypeScript configuration
└── yarn.lock              # Yarn lock file
```

## 🔌 Key Features & Integrations

### Health Tracking

Habidot seamlessly integrates with health platforms to automatically verify user progress:

- **iOS:** Integration with Apple HealthKit via `react-native-health`
- **Android:** Connection to Google Fit via `@react-native-google-signin/google-signin`
- Automatic step counting and goal verification
- Daily progress tracking and historical data analysis

### Solana Blockchain Integration

Habidot leverages Solana blockchain for secure financial transactions:

- Mobile wallet integration using `@solana-mobile/mobile-wallet-adapter-protocol`
- Smart contract integration with `@coral-xyz/anchor`
- Secure transaction signing and verification
- Okto SDK integration for additional wallet features

### User Experience

- Beautiful UI with animations via `react-native-reanimated`
- Progress visualization with `react-native-circular-progress` and `react-native-progress`
- Celebration animations with `react-native-confetti`
- Intuitive navigation using `@react-navigation` suite
- Responsive layouts with NativeWind (TailwindCSS)

## 🔐 Security Features

- Secure authentication with Google Sign-In
- Solana blockchain for transparent and secure financial transactions
- AsyncStorage for secure local data storage
- Environment variable protection for API keys

## 🧠 Smart Contract Features

Habidot's smart contracts on Solana enable:

- Transparent stake pooling for challenges
- Automated verification of goal completion
- Fair distribution of rewards to successful participants
- Immutable record of challenge participation and results

## 💡 Customization

Users can customize their experience with:

- Personal profile settings
- Challenge difficulty levels
- Stake amount selection
- Private vs. public challenge participation
- Notification preferences

## 🚀 Deployment

### Expo Build

You can build the app using Expo Application Services (EAS):

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to your Expo account
eas login

# Configure your build
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

### Manual Build

#### Android

```bash
# Generate a release build
cd android
./gradlew assembleRelease
```

The APK will be available at `android/app/build/outputs/apk/release/app-release.apk`

#### iOS (requires macOS)

Build using Xcode by opening the `.xcworkspace` file in the `ios` directory.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙌 Acknowledgements

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [Solana](https://solana.com/)
- [NativeWind](https://www.nativewind.dev/)
- [React Navigation](https://reactnavigation.org/)

---

<div align="center">
  <p>Built with ❤️ by the Habidot Team</p>
</div>
