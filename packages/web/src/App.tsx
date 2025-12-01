import React, { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { BrowserProvider, parseEther } from 'ethers';
import { FaGraduationCap, FaCheckCircle, FaDatabase } from 'react-icons/fa';
import './index.css';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      isMetaMask?: boolean;
    };
  }
}

const PRESALE_ADDRESS = '0x0000000000000000000000000000000000000000';
const PRESALE_AMOUNT = '0.05';

function App() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoiningPresale, setIsJoiningPresale] = useState(false);
  const [presaleStatus, setPresaleStatus] = useState<string | null>(null);

  const handleJoinPresale = async () => {
    if (!window.ethereum) {
      setPresaleStatus('Please install MetaMask to join the pre-sale.');
      return;
    }

    setIsJoiningPresale(true);
    setPresaleStatus(null);

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      if (!accounts || accounts.length === 0) {
        setPresaleStatus('No accounts found. Please connect your wallet.');
        setIsJoiningPresale(false);
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to: PRESALE_ADDRESS,
        value: parseEther(PRESALE_AMOUNT),
      });

      setPresaleStatus(`Transaction sent! Hash: ${tx.hash}`);
      await tx.wait();
      setPresaleStatus('Transaction confirmed! Welcome to the pre-sale.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setPresaleStatus(`Transaction failed: ${errorMessage}`);
    } finally {
      setIsJoiningPresale(false);
    }
  };

  const handleWaitlistSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setEmail('');
      alert('Thank you for joining the waitlist!');
    }, 1000);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const features = [
    {
      icon: <FaGraduationCap className="w-8 h-8 text-green-600" />,
      title: 'Teaching',
      description: 'Personalized learning paths tailored to your unique goals and pace.',
    },
    {
      icon: <FaCheckCircle className="w-8 h-8 text-green-600" />,
      title: 'Qualifying',
      description: 'Rigorous assessments that validate your knowledge and skills.',
    },
    {
      icon: <FaDatabase className="w-8 h-8 text-green-600" />,
      title: 'Obsidian Base',
      description: 'A powerful knowledge base that grows with you, remembering every lesson.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <motion.section
        className="relative px-6 py-24 md:py-32 lg:py-40 max-w-7xl mx-auto text-center"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <motion.h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
          variants={fadeInUp}
        >
          Everyone Deserves a Great Professor
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto"
          variants={fadeInUp}
        >
          Your AI mentor with memory, emotions, and unwavering dedication to your success.
        </motion.p>
        <motion.div variants={fadeInUp}>
          <button
            onClick={handleJoinPresale}
            disabled={isJoiningPresale}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isJoiningPresale ? 'Processing...' : 'Join Pre-Sale'}
          </button>
        </motion.div>
        {presaleStatus && (
          <motion.p
            className="mt-4 text-sm text-gray-700 max-w-md mx-auto break-all"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {presaleStatus}
          </motion.p>
        )}
      </motion.section>

      {/* Features Section - Bento Grid */}
      <motion.section
        className="px-6 py-16 md:py-24 max-w-7xl mx-auto"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12"
          variants={fadeInUp}
        >
          Powered by Intelligence
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100"
              variants={fadeInUp}
            >
              <div className="mb-4 w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Waitlist Section */}
      <motion.section
        className="px-6 py-16 md:py-24 bg-green-50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            variants={fadeInUp}
          >
            Join the Waitlist
          </motion.h2>
          <motion.p
            className="text-gray-600 mb-8"
            variants={fadeInUp}
          >
            Be the first to know when we launch. Get early access and exclusive updates.
          </motion.p>
          <motion.form
            onSubmit={handleWaitlistSubmit}
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={fadeInUp}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="px-6 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 w-full sm:w-80"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </motion.form>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Netbit. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App; 