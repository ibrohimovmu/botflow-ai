import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import BuilderPage from './pages/BuilderPage';
import PromoAdPage from './pages/PromoAdPage';
import ShowcasePage from './pages/ShowcasePage';
import AuthorPortfolio from './pages/AuthorPortfolio';

const PageContent: React.FC = () => {
  const { page } = useApp();

  const showNav = page === 'landing' || page === 'showcase' || page === 'author';

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {showNav && <Navbar />}
      <AnimatePresence mode="wait">
        {page === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LandingPage />
          </motion.div>
        )}
        {page === 'auth' && (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <AuthPage />
          </motion.div>
        )}
        {page === 'builder' && (
          <motion.div
            key="builder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-screen overflow-hidden"
          >
            <BuilderPage />
          </motion.div>
        )}
        {page === 'promo' && (
          <motion.div
            key="promo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen w-full overflow-hidden"
          >
            <PromoAdPage />
          </motion.div>
        )}
        {page === 'showcase' && (
          <motion.div
            key="showcase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen pt-20"
          >
            <ShowcasePage />
          </motion.div>
        )}
        {page === 'author' && (
          <motion.div
            key="author"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="min-h-screen pt-20"
          >
            <AuthorPortfolio />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <PageContent />
  </AppProvider>
);

export default App;
