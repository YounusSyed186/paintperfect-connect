import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleAuthMode = useCallback(() => {
    setIsLogin(prev => !prev);
  }, []);

  // Animation variants
  const authFormVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: "easeInOut" }
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full">
        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.div
              key="login-form"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={authFormVariants}
            >
              <LoginForm onToggleMode={toggleAuthMode} />
            </motion.div>
          ) : (
            <motion.div
              key="signup-form"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={authFormVariants}
            >
              <SignUpForm onToggleMode={toggleAuthMode} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};