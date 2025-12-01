import React, { useState } from 'react';
import { motion } from 'framer-motion';
import '../types/ethereum.d';

const Navbar: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];
      
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-green-500/20"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Netbit
            </span>
          </motion.div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-green-400 transition-colors">
              Features
            </a>
            <a href="#presale" className="text-gray-300 hover:text-green-400 transition-colors">
              Pre-sale
            </a>
            <a 
              href="https://docs.netbit.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-green-400 transition-colors"
            >
              Docs
            </a>
          </div>

          {/* Connect Wallet Button */}
          <motion.button
            onClick={connectWallet}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              px-6 py-2.5 rounded-lg font-medium text-sm
              transition-all duration-300
              ${isConnected
                ? 'bg-green-500/20 border border-green-500 text-green-400'
                : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/25'
              }
            `}
          >
            {isConnected && account ? formatAddress(account) : 'Connect Wallet'}
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
