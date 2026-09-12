import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EcoProvider, useEco } from './context/EcoContext';
import { EcoTopBar, EcoBottomBar } from './components/EcoBars';
import { HomeScreen } from './screens/HomeScreen';
import { ScannerScreen } from './screens/ScannerScreen';
import { DisposalScreen } from './screens/DisposalScreen';
import { WalletScreen } from './screens/WalletScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { AboutScreen } from './screens/AboutScreen';
import { AdminScreen } from './screens/AdminScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { ForbiddenScreen } from './screens/ForbiddenScreen';
import { AuthScreen } from './screens/AuthScreen';
import { EcoFooter } from './components/EcoFooter';

const MainContent: React.FC = () => {
  const { currentRoute } = useEco();

  const renderScreen = () => {
    switch (currentRoute) {
      case 'home':
        return <HomeScreen />;
      case 'scanner':
        return <ScannerScreen />;
      case 'disposal':
        return <DisposalScreen />;
      case 'wallet':
        return <WalletScreen />;
      case 'leaderboard':
        return <LeaderboardScreen />;
      case 'about':
        return <AboutScreen />;
      case 'admin':
        return <AdminScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'auth':
        return <AuthScreen />;
      case 'forbidden':
        return <ForbiddenScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <EcoTopBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 sm:pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRoute}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      <EcoFooter />
      <EcoBottomBar />
    </div>
  );
};

export function App() {
  return (
    <EcoProvider>
      <MainContent />
    </EcoProvider>
  );
}

export default App;
