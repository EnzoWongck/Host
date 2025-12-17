# HostPokerMoney

> Professional Poker Game Management Web Application

A comprehensive solution for managing poker games, tracking players, dealers, expenses, and financial records in real-time.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run web
```

Visit `http://localhost:8081` in your browser.

## ✨ Features

- 🎮 **Game Management** - Create and manage multiple poker games
- 👥 **Player Tracking** - Buy-ins, cash-outs, and profit/loss calculations
- 🎯 **Dealer Management** - Track hours and calculate wages
- 💰 **Financial Records** - Expenses, rake, and insurance tracking
- 🔐 **Secure Authentication** - Firebase Auth with Google Sign-in
- 💳 **PayPal Subscriptions** - Premium features with secure payments
- 🌐 **Multi-language** - Traditional & Simplified Chinese
- 🎨 **Dark/Light Mode** - Customizable themes
- 📱 **PWA Ready** - Installable as a web app

## 🛠️ Tech Stack

- **React Native** + **Expo** (Web, iOS, Android)
- **TypeScript** for type safety
- **Firebase** for authentication
- **PayPal SDK** for subscriptions
- **React Navigation** for routing
- **Context API** for state management

## 📱 Main Screens

1. **Welcome** - App introduction and entry point
2. **Login/Signup** - Firebase authentication
3. **Home** - Game list and management
4. **Game** - Active game tracking and operations
5. **Settings** - User preferences and subscription

## 🎮 Core Functionality

### Game Operations
- Create new games with custom settings
- Add/remove players
- Record buy-ins and cash-outs
- Track dealer shifts and wages
- Record expenses (rent, food, etc.)
- Calculate rake and insurance
- Export game summaries

### Player Management
- Individual profit/loss tracking
- Transaction history
- Multiple buy-in support
- Detailed player statistics

## 🔐 Authentication

- **Google Sign-in** - OAuth 2.0 integration
- **Email/Password** - Firebase Authentication
- **Phone Verification** - SMS-based 2FA

## 💳 Subscription

- **Free Tier**: 1 game (24-hour limit)
- **Premium Tier**: Unlimited games
- **PayPal Integration**: Secure subscription management

## 🌐 Internationalization

- Traditional Chinese (zh-TW)
- Simplified Chinese (zh-CN)
- Easy language switching
- Persistent preferences

## 🎨 Theming

- **Light Mode** - Clean, bright interface
- **Dark Mode** - Eye-friendly dark theme (#121212)
- Customizable colors and fonts

## 📊 Data Management

- **Local Storage** - All data stored locally (AsyncStorage)
- **Data Export** - JSON export for backups
- **Privacy First** - No data sent to external servers (except Firebase Auth)

## 🚀 Available Commands

```bash
npm run web              # Start web server
npm run web:clean        # Clear cache and start
npm run web:lan          # Start with LAN access
npm run dev              # Start with WebSocket server
npm run kill             # Stop all processes
```

## 📦 Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/         # Screen components
├── context/         # State management (Context API)
├── config/          # Configuration files
├── types/           # TypeScript definitions
├── utils/           # Utility functions
└── locales/         # Translation files
```

## 🔧 Configuration

### PayPal Setup
Edit `src/config/dev.ts`:
```typescript
export const PAYPAL_CLIENT_ID = 'your-client-id';
export const PAYPAL_USE_SANDBOX = true; // false for production
```

### Firebase Setup
Configure in `src/config/firebase.ts` with your Firebase credentials.

## 📱 Mobile Testing

1. Start with LAN access: `npm run web:lan`
2. Find your IP address in terminal
3. Open `http://[YOUR_IP]:8081` on mobile device
4. Ensure same Wi-Fi network

## 🐛 Troubleshooting

**Port in use?** Expo will auto-select another port.

**Module not found?** Run `npm install` and `npm run web:clean`

**PayPal not working?** Check Client ID in `src/config/dev.ts`

## 🚀 Deployment

```bash
# Build for production
npx expo export:web

# Output in web-build/
```

Deploy to Vercel, Netlify, Firebase Hosting, or any static host.

## 📄 License

[Your License]

## 🤝 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ using React Native, Expo, and Firebase**













