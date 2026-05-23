# Fabricator

> A premium industrial builder operating system designed for fabrication shops, restoration builds, woodworking, race builds, and creator projects.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-latest-black.svg)](https://expo.dev)

## 🎨 Design Direction

A cinematic workshop aesthetic with industrial surfaces, ember-orange highlights, and walnut & brushed steel accents. Immersive dashboard hierarchy with photo-first storytelling and tactical operational clarity.

- **Cinematic Workshop Aesthetic** - Matte industrial surfaces with premium feel
- **Color Palette** - Ember-orange highlights, walnut and brushed steel accents
- **Visual Hierarchy** - Immersive dashboard with clear operational focus
- **Photo-First** - Cinematic gallery experience for project documentation
- **Dark Mode** - Professional dark UI optimized for workshop environments

## ✨ MVP Features

- 📊 **Project Dashboard** - Visual overview of all active projects
- 📝 **Build Logging** - Detailed project documentation and progress tracking
- 🏗️ **Garage Session Tracking** - Time management and session analytics
- 📦 **Tasks & Inventory** - Project task management and material inventory
- 🤖 **AI-Assisted Summaries** - Automatic documentation summaries
- 🖼️ **Gallery Experience** - Cinematic photo documentation

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator or Android Emulator (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/hsparksjr1980-stack/fabricator.git
cd fabricator/fabricator-app

# Install dependencies
npm install
# or
yarn install

# Type checking
npm run typecheck
```

### Development

```bash
# Start Expo dev server
npm start

# Run on specific platform
npm run ios        # iOS Simulator
npm run android    # Android Emulator
npm run web        # Web browser
```

### Mobile Development

1. Download **Expo Go** from [App Store](https://apps.apple.com/app/expo-go/id982107779) or [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Run `npm start` in the project directory
3. Scan the QR code with your phone camera or Expo Go app
4. View changes instantly with hot reload

## 📁 Project Structure

```
fabricator/
├── fabricator-app/          # Expo React Native app
│   ├── src/
│   │   ├── screens/         # App screens/pages
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API and business logic
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   ├── styles/         # Theme and global styles
│   │   └── App.tsx         # Root component
│   ├── app.json            # Expo configuration
│   ├── tsconfig.json       # TypeScript configuration
│   └── package.json        # Dependencies
├── supabase/               # Supabase backend configuration
├── README.md               # This file
├── CHANGELOG.md            # Version history
└── .gitignore
```

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo
- **Language**: TypeScript (100%)
- **Backend**: Supabase
- **Styling**: React Native & Expo
- **Type Safety**: TypeScript strict mode

## 📦 Dependencies

Key libraries:
- `expo` - Cross-platform development framework
- `react-native` - Mobile app framework
- Additional dependencies in `fabricator-app/package.json`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in `fabricator-app/`:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
EXPO_PUBLIC_API_URL=your_api_url
```

See `.env.example` for all available variables.

## 📱 Deployment

### Web Preview

View the live preview: [fabricator-phi.vercel.app](https://fabricator-phi.vercel.app)

### Build for Production

```bash
# Requires EAS account
eas build --platform all

# Submit to app stores
eas submit
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**hsparksjr1980-stack**
- GitHub: [@hsparksjr1980-stack](https://github.com/hsparksjr1980-stack)

## 🙌 Acknowledgments

- Expo team for the excellent cross-platform framework
- Supabase for backend services
- The fabrication and maker community for inspiration

---

<div align="center">

**Built for creators, by creators.**

[Live Preview](https://fabricator-phi.vercel.app) • [Report Bug](https://github.com/hsparksjr1980-stack/fabricator/issues) • [Request Feature](https://github.com/hsparksjr1980-stack/fabricator/issues)

</div>
