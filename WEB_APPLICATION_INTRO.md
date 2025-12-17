# HostPokerMoney - Web Application Introduction

## 🎯 Overview

**HostPokerMoney** is a professional poker game management web application built with React Native and Expo. It provides a comprehensive solution for managing poker games, tracking players, dealers, expenses, and financial records in real-time.

### Key Features

- 🎮 **Game Management**: Create, manage, and track multiple poker games
- 👥 **Player Management**: Track buy-ins, cash-outs, and player profits/losses
- 🎯 **Dealer Management**: Monitor dealer hours and calculate wages
- 💰 **Financial Tracking**: Record expenses, rake, and insurance transactions
- 🔐 **User Authentication**: Secure login with Firebase Authentication
- 💳 **Subscription System**: PayPal integration for premium features
- 🌐 **Multi-language**: Support for Traditional and Simplified Chinese
- 🎨 **Theme Support**: Dark and light mode with customizable themes
- 📱 **PWA Ready**: Installable as a Progressive Web App

---

## 🏗️ Architecture

### Technology Stack

**Frontend Framework**
- React Native 0.81.4 (with React Native Web)
- Expo SDK 54
- React 19.1.0
- TypeScript 5.9.2

**State Management**
- React Context API
- useReducer for complex state logic
- AsyncStorage for local persistence

**Backend Services**
- Firebase Authentication
- Firebase Firestore (optional)
- WebSocket for real-time collaboration (optional)

**Navigation**
- React Navigation 6
- Bottom Tab Navigator
- Stack Navigator

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Host

# Install dependencies
npm install

# Start the development server
npm run web
```

The application will automatically open in your browser at `http://localhost:8081` (or the port shown in the terminal).

### Available Commands

```bash
npm run web              # Start web development server
npm run web:clean        # Clear cache and start
npm run web:lan          # Start with LAN access (for mobile testing)
npm run dev              # Start with WebSocket server (for collaboration)
npm run kill             # Stop all Expo processes
```

---

## 📱 Application Structure

### Main Screens

1. **Welcome Screen**
   - First-time user introduction
   - App branding and features overview
   - Entry point to login/signup

2. **Login/Signup Screen**
   - Firebase Authentication integration
   - Google Sign-in support
   - Email/Password authentication
   - Phone number verification

3. **Home Screen**
   - List of all poker games
   - Create new game
   - View game history
   - Quick access to active games

4. **Game Screen**
   - Active game management
   - Player list with buy-in/cash-out
   - Dealer management
   - Expense tracking
   - Rake and insurance records
   - Real-time profit/loss calculations

5. **Settings Screen**
   - User profile management
   - Theme customization (dark/light mode)
   - Language selection
   - Subscription management
   - Privacy settings
   - Data export/backup

---

## 🎮 Core Features

### Game Management

**Create a New Game**
- Set game name and start time
- Configure entry fees
- Set profit sharing rules
- Add initial players

**Game Operations**
- Add/remove players
- Record buy-ins and cash-outs
- Track dealer shifts
- Record expenses (rent, food, etc.)
- Calculate rake
- Manage insurance transactions

**Game Summary**
- Total buy-ins
- Total cash-outs
- Net profit/loss
- Player statistics
- Dealer wages
- Expense breakdown
- Export game summary

### Player Management

**Player Actions**
- Add player to game
- Record buy-in amount
- Record cash-out amount
- View player history
- Calculate individual profit/loss

**Player Details**
- All buy-in records
- All cash-out records
- Net profit/loss
- Transaction history

### Financial Tracking

**Expense Categories**
- Rent
- Food & Drinks
- Transportation
- Miscellaneous
- Custom categories

**Rake Management**
- Record rake amounts
- Track rake by time period
- Calculate total rake

**Insurance**
- Record insurance transactions
- Track insurance partners
- Calculate insurance payouts

---

## 🔐 Authentication & Security

### Authentication Methods

1. **Google Sign-in**
   - OAuth 2.0 integration
   - Secure token management
   - Cross-platform support

2. **Email/Password**
   - Firebase Authentication
   - Secure password storage
   - Email verification

3. **Phone Verification**
   - SMS verification code
   - Two-factor authentication
   - Enhanced security

### Data Security

- All data stored locally using AsyncStorage
- Firebase Authentication for secure user management
- No sensitive payment data stored locally
- PayPal handles all payment transactions securely

---

## 💳 Subscription System

### Features

- **Free Tier**: Limited to 1 game (24-hour limit)
- **Premium Tier**: Unlimited games and features
- **PayPal Integration**: Secure subscription management

### Subscription Flow

1. User clicks "Subscribe Now" button
2. PayPal SDK loads and displays subscription options
3. User completes payment through PayPal
4. Subscription status updates automatically
5. Premium features unlock immediately

### Configuration

Subscription settings can be configured in `src/config/dev.ts`:
- PayPal Client ID (Sandbox/Live)
- Subscription plan ID
- Environment (Sandbox/Production)

---

## 🌐 Internationalization

### Supported Languages

- **Traditional Chinese (zh-TW)**
- **Simplified Chinese (zh-CN)**

### Language Features

- Dynamic language switching
- Persistent language preference
- Localized date/time formats
- Currency formatting

### Adding New Languages

1. Create new locale file in `src/locales/`
2. Add translations for all keys
3. Update `LanguageContext.tsx`
4. Add language option in settings

---

## 🎨 Theming

### Theme Modes

**Light Mode**
- Clean, bright interface
- High contrast for readability
- Professional appearance

**Dark Mode**
- Eye-friendly dark background (#121212)
- Reduced eye strain
- Modern aesthetic

### Customization

- Theme colors configurable
- Font sizes adjustable
- Custom color schemes supported

---

## 📊 Data Management

### Local Storage

All data is stored locally using AsyncStorage:
- Game data
- User preferences
- Theme settings
- Language settings
- Authentication state

### Data Export

- Export game summaries as JSON
- Export all games data
- Backup/restore functionality

### Data Privacy

- All data stored locally
- No data sent to external servers (except Firebase Auth)
- User controls data export/backup
- Clear local data option available

---

## 🔧 Development

### Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
├── context/            # React Context providers
├── config/             # Configuration files
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── locales/            # Translation files
```

### Key Components

**GameContext**
- Manages all game state
- Handles game operations
- Persists data to AsyncStorage

**AuthContext**
- Manages authentication state
- Handles login/logout
- Integrates with Firebase

**ThemeContext**
- Manages theme state
- Handles theme switching
- Persists theme preference

**SubscriptionContext**
- Manages subscription status
- Handles trial period
- Integrates with PayPal

### Configuration Files

**`src/config/dev.ts`**
- Development flags
- PayPal configuration
- Feature toggles

**`src/config/firebase.ts`**
- Firebase configuration
- Authentication setup

**`app.json`**
- Expo configuration
- PWA settings
- App metadata

---

## 🌐 Web-Specific Features

### Progressive Web App (PWA)

- **Installable**: Can be installed as a web app
- **Offline Support**: Works with cached data
- **App-like Experience**: Full-screen, standalone mode
- **Fast Loading**: Optimized bundle size

### Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

### Performance Optimizations

- Code splitting
- Lazy loading
- Asset preloading
- Memoization

---

## 📱 Mobile Access

### Testing on Mobile Devices

1. Start server with LAN access:
   ```bash
   npm run web:lan
   ```

2. Find your computer's IP address (shown in terminal)

3. Open browser on mobile device:
   ```
   http://[YOUR_IP]:8081
   ```

4. Ensure both devices are on the same Wi-Fi network

---

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
- Expo will automatically use another port
- Check terminal output for the correct URL

**Module Not Found**
- Run `npm install`
- Clear cache: `npm run web:clean`

**PayPal Button Not Showing**
- Check PayPal Client ID in `src/config/dev.ts`
- Verify `dangerouslySetInnerHTML: true` in `app.json`
- Check browser console for errors

**Fonts Not Loading**
- Check internet connection
- Verify Google Fonts is accessible
- Check browser console for errors

**Authentication Issues**
- Verify Firebase configuration
- Check Firebase project settings
- Ensure authorized domains are configured

---

## 🚀 Deployment

### Production Build

```bash
# Build for production
npx expo export:web

# Output will be in web-build/
```

### Hosting Options

- **Vercel**: Easy deployment with Git integration
- **Netlify**: Automatic deployments
- **Firebase Hosting**: Integrated with Firebase
- **AWS S3 + CloudFront**: Scalable hosting
- **Any static hosting**: Works with any static file server

### Environment Variables

For production, update:
- PayPal Client ID (use Live credentials)
- Firebase configuration
- API endpoints
- Subscription plan IDs

---

## 📚 API Reference

### Context Hooks

**useGame()**
```typescript
const { games, currentGame, addGame, updateGame } = useGame();
```

**useAuth()**
```typescript
const { user, isSignedIn, signInWithGoogle, signOut } = useAuth();
```

**useTheme()**
```typescript
const { theme, colorMode, setColorMode } = useTheme();
```

**useLanguage()**
```typescript
const { language, setLanguage, t } = useLanguage();
```

**useSubscription()**
```typescript
const { isSubscribed, trialEnded, subscribe } = useSubscription();
```

---

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style

- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Maintain consistent naming conventions

---

## 📄 License

[Add your license information here]

---

## 📞 Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Contact support: [your-email]
- Documentation: [your-docs-url]

---

## 🎉 Features Roadmap

### Planned Features

- [ ] Real-time collaboration (WebSocket)
- [ ] Cloud backup/sync
- [ ] Advanced analytics
- [ ] Export to PDF
- [ ] Mobile app versions (iOS/Android)
- [ ] More language support
- [ ] Custom themes
- [ ] Game templates

---

## 🙏 Acknowledgments

Built with:
- React Native
- Expo
- Firebase
- PayPal
- React Navigation
- And many other amazing open-source libraries

---

**HostPokerMoney** - Professional Poker Game Management Made Easy













