import React, { useState } from 'react';
import { BrowserProvider, parseEther } from 'ethers';
import { motion } from 'framer-motion';
import '../types/ethereum.d';

const PRESALE_ADDRESS = '0x0000000000000000000000000000000000000000';
const PRESALE_AMOUNT = '0.05';

const PresaleButton: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to participate in the pre-sale!');
      return;
    }

    setIsLoading(true);
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
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTransaction = async () => {
    if (!window.ethereum || !account) {
      alert('Please connect your wallet first!');
      return;
    }

    setIsLoading(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const tx = await signer.sendTransaction({
        to: PRESALE_ADDRESS,
        value: parseEther(PRESALE_AMOUNT),
      });

      await tx.wait();
      alert('Transaction successful! Thank you for participating in the pre-sale.');
    } catch (error) {
      console.error('Transaction error:', error);
      alert('Transaction failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (isConnected) {
      sendTransaction();
    } else {
      connectWallet();
    }
  };

  const buttonText = isLoading 
    ? 'Processing...' 
    : isConnected 
      ? `Pay ${PRESALE_AMOUNT} ETH` 
      : 'Join Pre-sale (Connect Wallet)';

  return (
    <motion.button
      onClick={handleClick}
      disabled={isLoading}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        px-8 py-4 rounded-xl font-semibold text-lg
        transition-all duration-300 shadow-lg
        ${isLoading 
          ? 'bg-gray-400 cursor-not-allowed' 
          : isConnected 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-green-500/25' 
            : 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white shadow-green-400/25'
        }
      `}
    >
      {buttonText}
    </motion.button>
  );
};

export default PresaleButton;
