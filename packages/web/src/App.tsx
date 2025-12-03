import React, { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { BrowserProvider, parseEther } from 'ethers';
import { 
  FaGraduationCap, 
  FaCheckCircle, 
  FaDatabase, 
  FaComments, 
  FaGithub, 
  FaProjectDiagram, 
  FaUsers, 
  FaCheck,
  FaArrowRight,
  FaRocket,
  FaStar
} from 'react-icons/fa';
import './index.css';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      isMetaMask?: boolean;
    };
  }
}

// TODO: Replace with actual presale contract address before production launch
const PRESALE_ADDRESS = '0x0000000000000000000000000000000000000000';
const PRESALE_AMOUNT = '0.05';

function App() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waitlistMessage, setWaitlistMessage] = useState<string | null>(null);
  const [isJoiningPresale, setIsJoiningPresale] = useState(false);
  const [presaleStatus, setPresaleStatus] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
    setWaitlistMessage(null);
    // TODO: Replace with actual API call to waitlist service
    setTimeout(() => {
      setIsSubmitting(false);
      setEmail('');
      setWaitlistMessage('Thank you for joining the waitlist!');
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

  const ecosystemFeatures = [
    {
      icon: <FaGraduationCap className="w-6 h-6 text-white" />,
      title: 'Teaching',
      status: 'IN DEVELOPMENT',
      statusColor: 'bg-green-100 text-green-700',
      description: 'Your AI Professor learns your style, remembers your struggles, and adapts lessons just for you. Like having a world-class mentor available 24/7.',
      bullets: ['Personalized learning paths', 'Progress memory retention', 'Adapts to your pace'],
      iconBg: 'bg-green-500',
      cardBg: 'bg-green-50',
      illustration: (
        <div className="relative h-48 flex items-center justify-center">
          {/* Spline placeholder - AI Professor Teaching */}
          <div className="spline-placeholder w-full h-full rounded-xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center overflow-hidden">
            <motion.div 
              className="flex items-center gap-4"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                <div className="w-10 h-10 bg-white rounded-lg" />
              </div>
              <div className="w-14 h-14 bg-green-200 rounded-xl flex items-center justify-center">
                <FaUsers className="w-6 h-6 text-green-600" />
              </div>
            </motion.div>
          </div>
        </div>
      )
    },
    {
      icon: <FaCheckCircle className="w-6 h-6 text-white" />,
      title: 'Qualifying',
      status: 'PLANNED',
      statusColor: 'bg-gray-100 text-gray-600',
      description: 'Validate your skills through comprehensive assessments. Your AI Professor ensures you truly master concepts before moving forward.',
      bullets: ['Skill verification system', 'Progress certifications', 'Mastery tracking'],
      iconBg: 'bg-amber-500',
      cardBg: 'bg-amber-50',
      illustration: (
        <div className="relative h-48 flex items-center justify-center">
          {/* Spline placeholder - Qualifying System */}
          <div className="spline-placeholder w-full h-full rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center overflow-hidden">
            <motion.div 
              className="flex flex-col items-center gap-2"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                <FaStar className="w-8 h-8 text-white" />
              </div>
              <div className="flex gap-2 mt-2">
                <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                  <FaCheck className="w-4 h-4 text-white" />
                </div>
                <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                  <FaCheck className="w-4 h-4 text-white" />
                </div>
                <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                  <FaCheck className="w-4 h-4 text-white" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )
    },
    {
      icon: <FaComments className="w-6 h-6 text-white" />,
      title: 'Communicating',
      status: 'PLANNED',
      statusColor: 'bg-gray-100 text-gray-600',
      description: 'Your AI Professor cares about you. It celebrates your victories, understands your struggles, and provides emotional support throughout your journey.',
      bullets: ['Emotional intelligence', 'Motivational support', 'Always available'],
      iconBg: 'bg-pink-500',
      cardBg: 'bg-pink-50',
      illustration: (
        <div className="relative h-48 flex items-center justify-center">
          {/* Spline placeholder - Communication */}
          <div className="spline-placeholder w-full h-full rounded-xl bg-gradient-to-br from-pink-100 to-pink-50 flex items-center justify-center overflow-hidden">
            <motion.div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 bg-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <FaComments className="w-10 h-10 text-white" />
              </div>
              <motion.div 
                className="flex gap-2"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="px-3 py-1 bg-white rounded-full text-sm text-pink-600 shadow-sm border border-pink-200">You got this!</div>
              </motion.div>
              <motion.div 
                className="flex gap-2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              >
                <div className="px-3 py-1 bg-white rounded-full text-sm text-pink-600 shadow-sm border border-pink-200">Let me help</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      )
    },
    {
      icon: <FaDatabase className="w-6 h-6 text-white" />,
      title: 'Obsidian Base',
      status: 'IN DEVELOPMENT',
      statusColor: 'bg-green-100 text-green-700',
      description: 'Triple knowledge base system: personal vault, AI Professor shared space, and project documentation. All powered by Obsidian for connected thinking.',
      bullets: ['Personal knowledge vault', 'Professor shared notes', 'Project documentation'],
      iconBg: 'bg-gray-700',
      cardBg: 'bg-gray-100',
      illustration: (
        <div className="relative h-48 flex items-center justify-center">
          {/* Spline placeholder - Obsidian Base */}
          <div className="spline-placeholder w-full h-full rounded-xl bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center overflow-hidden">
            <motion.div 
              className="relative"
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
            >
              <div className="w-24 h-24 bg-gray-700 rounded-2xl flex items-center justify-center shadow-xl">
                <FaDatabase className="w-12 h-12 text-white" />
              </div>
              <motion.div 
                className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div 
                className="absolute -bottom-4 -left-4 w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
              <motion.div 
                className="absolute -bottom-4 -right-4 w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              />
            </motion.div>
          </div>
        </div>
      )
    },
  ];

  const infrastructureFeatures = [
    {
      icon: <FaGithub className="w-8 h-8 text-red-500" />,
      title: 'Private Repositories',
      description: 'Host unlimited private Git repositories with full version control',
    },
    {
      icon: <FaProjectDiagram className="w-8 h-8 text-green-500" />,
      title: 'Project Management',
      description: 'Integrated issue tracking, boards, and workflow automation',
    },
    {
      icon: <FaUsers className="w-8 h-8 text-blue-500" />,
      title: 'Team Collaboration',
      description: 'Code review, pull requests, and team communication tools',
    },
  ];

  const pricingPlans = [
    {
      name: 'Free Tier',
      price: '$0',
      period: 'forever',
      description: 'Start learning with your AI Professor',
      features: ['Basic AI Professor access', 'Git Server & Obsidian', 'Community support', 'Limited memory'],
      buttonText: 'Start Free',
      buttonStyle: 'border-2 border-gray-200 text-gray-700 hover:bg-gray-50',
      available: 'AVAILABLE NOW',
      availableColor: 'text-green-600',
      highlight: false
    },
    {
      name: 'Beginner Developer',
      price: '$8',
      originalPrice: '$15/month',
      discount: '47% OFF',
      period: '/month',
      description: 'Perfect for aspiring developers',
      features: ['Full AI Professor access', 'All 3 Obsidian bases', '2GB server resources', 'Spark CLI access', 'Priority support'],
      buttonText: 'Pre-Order Now',
      buttonStyle: 'bg-green-600 text-white hover:bg-green-700',
      available: 'PRE-SALE ONLY',
      availableColor: 'text-green-600',
      highlight: true,
      popular: true
    },
    {
      name: 'Professional',
      price: '$25',
      period: '/month',
      description: 'For serious developers',
      features: ['Everything in Beginner', 'Advanced AI capabilities', '10GB server resources', 'Custom domains', 'Team collaboration'],
      buttonText: 'Pre-Order',
      buttonStyle: 'border-2 border-gray-200 text-gray-700 hover:bg-gray-50',
      available: 'COMING SOON',
      availableColor: 'text-amber-600',
      highlight: false
    },
    {
      name: 'Enterprise',
      price: 'Grant',
      period: '',
      description: 'For validated developers and companies',
      features: ['Professor-validated work', 'Unlimited resources', 'Company hiring access', 'Professor negotiation', 'Funding opportunities'],
      buttonText: 'Learn More',
      buttonStyle: 'border-2 border-gray-200 text-gray-700 hover:bg-gray-50',
      available: 'VALIDATION REQUIRED',
      availableColor: 'text-blue-600',
      highlight: false
    },
  ];

  const faqs = [
    {
      question: 'When will Netbit launch?',
      answer: "We're currently in active development. Teaching module is being built now, with Obsidian knowledge base already complete. Join the waitlist to get notified when we launch early access."
    },
    {
      question: 'What makes this different?',
      answer: 'Your AI Professor has memory and emotions - it remembers your progress, adapts to your learning style, and genuinely cares about your success. Plus you get complete development infrastructure.'
    },
    {
      question: 'How does Enterprise hiring work?',
      answer: 'Companies must go through your AI Professor first - it evaluates opportunities, protects your interests, and negotiates terms on your behalf based on your career goals.'
    },
    {
      question: 'What can I deploy with Spark?',
      answer: 'Spark is perfect for deploying to multiple ARM devices like Raspberry Pi and Orange Pi. Share packages from your PC - great for IoT projects, edge computing, or managing device farms.'
    },
    {
      question: 'Is Free tier really free forever?',
      answer: 'Yes! Free tier includes basic AI Professor access, Git server, Obsidian knowledge base, and community support - completely free, no time limit. Upgrade anytime for more resources.'
    },
    {
      question: 'What are pre-sale benefits?',
      answer: "Pre-sale pricing locks in lifetime discounts - like $8/month instead of $15/month (47% off). Early access to new features and priority support. These prices won't be available after launch."
    },
  ];

  const footerLinks = {
    platform: [
      { name: 'AI Professor', badge: 'SOON' },
      { name: 'Obsidian Base', badge: 'SOON' },
      { name: 'Git Server', badge: 'SOON' },
      { name: 'Spark CLI', badge: 'SOON' },
    ],
    company: [
      { name: 'About Veloro', badge: 'SOON' },
      { name: 'Enterprise', badge: 'SOON' },
      { name: 'Roadmap', badge: 'SOON' },
    ],
    resources: [
      { name: 'Documentation', badge: 'SOON' },
      { name: 'Community', badge: 'SOON' },
      { name: 'Support', badge: 'SOON' },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Netbit</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
              IN DEVELOPMENT
            </span>
          </motion.div>
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-gray-500 text-sm hidden sm:block">Auth coming soon</span>
            <button 
              onClick={handleJoinPresale}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
            >
              Join Pre-Sale
            </button>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section
        className="px-6 py-16 md:py-24"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm relative overflow-hidden"
            variants={fadeInUp}
          >
            {/* Status badge */}
            <div className="absolute top-6 right-6">
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                IN DEVELOPMENT
              </span>
            </div>
            
            <div className="text-center mb-10">
              <motion.span 
                className="inline-flex items-center gap-2 text-green-600 text-sm font-medium mb-4"
                variants={fadeInUp}
              >
                <FaRocket className="w-4 h-4" />
                COMING SOON
              </motion.span>
              <motion.p 
                className="text-green-600 font-semibold mb-3"
                variants={fadeInUp}
              >
                Your Personal AI Professor
              </motion.p>
              <motion.h1 
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
                variants={fadeInUp}
              >
                Everyone Deserves<br />A Great Professor
              </motion.h1>
              <motion.p 
                className="text-gray-600 max-w-xl mx-auto mb-8"
                variants={fadeInUp}
              >
                Your AI mentor with memory, emotions, and unwavering dedication to your success. Complete development platform with Obsidian, Git server, and Spark infrastructure.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-3 justify-center mb-8"
                variants={fadeInUp}
              >
                <button
                  onClick={handleJoinPresale}
                  disabled={isJoiningPresale}
                  className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                >
                  <FaRocket className="w-4 h-4" />
                  {isJoiningPresale ? 'Processing...' : 'Join Pre-Sale'}
                </button>
                <button className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors">
                  Watch Demo
                  <FaArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
              
              {presaleStatus && (
                <p className="text-sm text-gray-600 max-w-md mx-auto break-all">
                  {presaleStatus}
                </p>
              )}
            </div>

            {/* Hero Visual - Spline Placeholder */}
            <motion.div 
              className="flex flex-col md:flex-row items-center justify-center gap-8"
              variants={fadeInUp}
            >
              <div className="flex items-center gap-4">
                {/* Main 3D Visual Placeholder - Replace with Spline embed */}
                <div className="spline-hero relative">
                  <motion.div 
                    className="w-28 h-28 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl flex items-center justify-center shadow-lg"
                    animate={{ rotate: [0, 5, 0, -5, 0], y: [0, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <div className="w-14 h-14 bg-white rounded-xl shadow-inner" />
                  </motion.div>
                </div>
                <motion.div 
                  className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                >
                  <FaUsers className="w-6 h-6 text-green-600" />
                </motion.div>
              </div>
              <div className="flex flex-col gap-2">
                {['Remembers your progress', 'Adapts to your style', 'Celebrates your wins'].map((text, idx) => (
                  <motion.div 
                    key={idx}
                    className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                  >
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <FaCheck className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-gray-700">{text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Platform Features - Bento Grid */}
      <motion.section
        className="px-6 py-16 md:py-24"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
              PLATFORM FEATURES
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-4">
              Complete Development Ecosystem
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              AI Professor, Obsidian knowledge base, Git server, and Spark infrastructure. Everything you need from learning to deployment.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ecosystemFeatures.map((feature, idx) => (
              <motion.div
                key={idx}
                className={`rounded-2xl p-6 border border-gray-100 ${feature.cardBg} hover:shadow-lg transition-shadow`}
                variants={fadeInUp}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${feature.statusColor}`}>
                    {feature.status}
                  </span>
                </div>
                
                {/* Spline 3D placeholder */}
                {feature.illustration}
                
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 ${feature.iconBg} rounded-xl flex items-center justify-center`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600 mb-4 text-sm">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.bullets.map((bullet, bulletIdx) => (
                    <li key={bulletIdx} className="flex items-center gap-2 text-sm text-gray-700">
                      <FaCheck className="w-4 h-4 text-green-500" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Spark CLI Section - Dark Theme */}
      <motion.section
        className="px-6 py-16 md:py-24 bg-gray-900"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <span className="text-xs bg-gray-800 text-green-400 px-3 py-1 rounded-full font-medium border border-gray-700">
              SPARK CLI
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-4">
              Deploy At Scale With Spark
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Rust-powered CLI for mass device deployment. Perfect for IoT projects, Raspberry Pi farms, and edge computing at scale.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Terminal Mockup - Spline 3D placeholder */}
            <motion.div 
              className="bg-gray-800 rounded-2xl p-4 border border-gray-700"
              variants={fadeInUp}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="font-mono text-sm space-y-2">
                <p className="text-gray-500">$ spark unique share ai-assistant-v2</p>
                <p className="text-green-400">Generated code: 755482</p>
                <p className="text-gray-400">Listening for connections...</p>
                <p className="text-green-400">✓ Device #1 connected</p>
                <p className="text-green-400">✓ Device #2 connected</p>
                <p className="text-green-400">✓ Device #3 connected</p>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <h3 className="text-xl font-bold text-white mb-4">Perfect for hardware entrepreneurs</h3>
              <p className="text-gray-400 mb-6">
                Deploy your packages from Netbit repository to multiple ARM devices (Raspberry Pi, Orange Pi, and similar) with a single command. Track device status, session duration, and manage deployments from your PC.
              </p>
              <p className="text-gray-500 mb-6 text-sm">
                Built with Rust for performance and reliability.
              </p>
              <ul className="space-y-3">
                {['One-command deployment', 'Real-time device monitoring', 'Session tracking & analytics'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-300">
                    <FaCheck className="w-4 h-4 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Infrastructure Section */}
      <motion.section
        className="px-6 py-16 md:py-24"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
              INFRASTRUCTURE
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-4">
              Git Server + Project Management
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Self-hosted Git server with integrated project management. Everything you need from day one, scales as you grow.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {infrastructureFeatures.map((feature, idx) => (
              <motion.div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow"
                variants={fadeInUp}
              >
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Enterprise Section */}
      <motion.section
        className="px-6 py-16 md:py-24 bg-gray-50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
              ENTERPRISE CONNECT
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-4">
              Companies Find Talent Through AI
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Enterprise subscribers connect with validated developers. Your AI Professor acts as mediator, protecting your interests and negotiating on your behalf.
            </p>
          </motion.div>

          {/* Enterprise Flow - Spline 3D placeholder */}
          <motion.div 
            className="flex flex-col md:flex-row items-center justify-center gap-8 py-8"
            variants={fadeInUp}
          >
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mb-3">
                <FaGithub className="w-10 h-10 text-red-500" />
              </div>
              <span className="font-medium text-gray-900">Enterprise</span>
              <span className="text-sm text-gray-500">Company discovers talent</span>
            </div>
            <div className="text-gray-300 text-2xl hidden md:block">→</div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mb-3">
                <FaGraduationCap className="w-10 h-10 text-green-500" />
              </div>
              <span className="font-medium text-gray-900">AI Professor</span>
              <span className="text-sm text-gray-500">Evaluates and protects</span>
            </div>
            <div className="text-gray-300 text-2xl hidden md:block">→</div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mb-3">
                <FaUsers className="w-10 h-10 text-amber-500" />
              </div>
              <span className="font-medium text-gray-900">Developer</span>
              <span className="text-sm text-gray-500">With approval, begins work</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section
        className="px-6 py-16 md:py-24"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
              PRE-SALE PRICING
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-4">
              Everyone Deserves Excellence
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Affordable access to world-class AI mentorship. Lock in pre-sale pricing before we launch.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, idx) => (
              <motion.div
                key={idx}
                className={`rounded-2xl p-6 border ${plan.highlight ? 'border-green-500 bg-green-600 text-white' : 'border-gray-100 bg-white'}`}
                variants={fadeInUp}
              >
                {plan.popular && (
                  <span className="inline-block text-xs bg-amber-400 text-amber-900 px-2 py-1 rounded-full font-medium mb-4">
                    POPULAR
                  </span>
                )}
                <h3 className={`text-lg font-bold mb-2 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-3xl font-bold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  <span className={plan.highlight ? 'text-green-100' : 'text-gray-500'}>
                    {plan.period}
                  </span>
                </div>
                {plan.originalPrice && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-sm line-through ${plan.highlight ? 'text-green-200' : 'text-gray-400'}`}>
                      {plan.originalPrice}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${plan.highlight ? 'bg-amber-400 text-amber-900' : 'bg-green-100 text-green-700'}`}>
                      {plan.discount}
                    </span>
                  </div>
                )}
                <p className={`text-sm mb-4 ${plan.highlight ? 'text-green-100' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className={`flex items-center gap-2 text-sm ${plan.highlight ? 'text-white' : 'text-gray-700'}`}>
                      <FaCheck className={`w-4 h-4 ${plan.highlight ? 'text-green-300' : 'text-green-500'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${plan.buttonStyle}`}>
                  {plan.buttonText}
                </button>
                <p className={`text-xs mt-3 ${plan.availableColor}`}>
                  {plan.available}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Waitlist Section */}
      <motion.section
        className="px-6 py-16 md:py-24 bg-gray-50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-3xl mx-auto text-center">
          <motion.div variants={fadeInUp}>
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
              JOIN WAITLIST
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-4">
              Be Among The First
            </h2>
            <p className="text-gray-600 mb-8">
              Join the waitlist for early access when we launch. Lock in exclusive pre-sale pricing and be notified first when platform goes live.
            </p>
          </motion.div>
          
          <motion.form 
            onSubmit={handleWaitlistSubmit}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-6"
            variants={fadeInUp}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full sm:w-80"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              <FaRocket className="w-4 h-4" />
              {isSubmitting ? 'Joining...' : 'Join Waitlist'}
            </button>
          </motion.form>
          
          {waitlistMessage && (
            <p className="text-green-600 text-sm mb-4">{waitlistMessage}</p>
          )}
          
          <motion.div 
            className="flex flex-wrap justify-center gap-6 text-sm text-gray-500"
            variants={fadeInUp}
          >
            <span className="flex items-center gap-2">
              <FaCheck className="w-4 h-4 text-green-500" />
              No commitment required
            </span>
            <span className="flex items-center gap-2">
              <FaCheck className="w-4 h-4 text-green-500" />
              Early access notification
            </span>
            <span className="flex items-center gap-2">
              <FaCheck className="w-4 h-4 text-green-500" />
              Exclusive pre-sale pricing
            </span>
          </motion.div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        className="px-6 py-16 md:py-24"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">
              Everything you need to know about Netbit platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
                variants={fadeInUp}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex items-start gap-3 w-full text-left"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-500 text-sm">{idx + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{faq.question}</h3>
                    {openFaq === idx && (
                      <p className="text-gray-600 text-sm mt-2">{faq.answer}</p>
                    )}
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
                <span className="font-bold text-lg text-gray-900">Netbit</span>
              </div>
              <p className="text-gray-500 text-sm mb-4">Everyone deserves a great professor</p>
              <p className="text-gray-400 text-xs">Created by Veloro</p>
              <p className="text-gray-400 text-xs">Special thanks to Kazilsky · 2025</p>
              <p className="text-gray-400 text-xs">general@veloro.su</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Platform</h4>
              <ul className="space-y-2">
                {footerLinks.platform.map((link, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-gray-600 text-sm">{link.name}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{link.badge}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2">
                {footerLinks.company.map((link, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-gray-600 text-sm">{link.name}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{link.badge}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Resources</h4>
              <ul className="space-y-2">
                {footerLinks.resources.map((link, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-gray-600 text-sm">{link.name}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{link.badge}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-100">
            <p className="text-gray-400 text-sm">© 2025 Veloro. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">DevPath Pro</span>
              <button className="inline-flex items-center gap-2 bg-green-600 text-white text-sm py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                Login to Subframe
                <FaArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
