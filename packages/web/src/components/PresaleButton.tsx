import React, { useState } from 'react';
import { BrowserProvider, parseEther } from 'ethers';

// Placeholder receiver address for presale transactions
const PRESALE_RECEIVER_ADDRESS = '0x0000000000000000000000000000000000000000';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      isMetaMask?: boolean;
    };
  }
}

interface PresaleButtonProps {
  className?: string;
}

const PresaleButton: React.FC<PresaleButtonProps> = ({ className = '' }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePresale = async () => {
    setError(null);
    setIsConnecting(true);

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to participate.');
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Send a dummy transaction (0.01 ETH to placeholder address)
      const tx = await signer.sendTransaction({
        to: PRESALE_RECEIVER_ADDRESS,
        value: parseEther('0.01'),
      });

      console.log('Transaction sent:', tx.hash);
      alert(`Transaction sent! Hash: ${tx.hash}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Presale error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={handlePresale}
        disabled={isConnecting}
        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 
          text-white font-bold py-4 px-8 rounded-xl shadow-lg 
          transition-all duration-300 transform hover:scale-105
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isConnecting ? 'Connecting...' : 'Join Presale'}
      </button>
      {error && (
        <p className="mt-2 text-red-400 text-sm text-center">{error}</p>
      )}
    </div>
  );
};

export default PresaleButton;
