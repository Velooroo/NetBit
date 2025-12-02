import React, { useState, FormEvent, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BrowserProvider, parseEther } from 'ethers';
import { 
  FaGraduationCap, 
  FaCheckCircle, 
  FaDatabase, 
  FaComments, 
  FaGithub, 
  FaProjectDiagram, 
  FaUsers, 
  FaTerminal,
  FaCheck,
  FaArrowRight,
  FaRocket,
  FaStar,
  FaBolt,
  FaCube
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

// Floating 3D shapes component - Dark Theme
const FloatingShapes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Animated gradient blobs - Dark theme */}
    <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-blob" />
    <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-green-600/15 to-teal-500/15 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
    <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-emerald-500/20 to-green-400/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
    <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '3s' }} />
    
    {/* Floating 3D cubes - Dark theme with glow */}
    <motion.div 
      className="absolute top-32 right-1/4 w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-2xl shadow-green-500/30 opacity-70"
      animate={{ 
        y: [0, -30, 0],
        rotate: [0, 10, 0],
        scale: [1, 1.1, 1]
      }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div 
      className="absolute top-1/2 left-16 w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-2xl shadow-emerald-500/30 opacity-60"
      animate={{ 
        y: [0, -20, 0],
        rotate: [0, -15, 0],
        x: [0, 10, 0]
      }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
    />
    <motion.div 
      className="absolute bottom-40 right-16 w-20 h-20 bg-gradient-to-br from-green-300 to-emerald-400 rounded-3xl shadow-2xl shadow-green-400/30 opacity-50"
      animate={{ 
        y: [0, -40, 0],
        rotate: [0, 20, 0]
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
    />
    
    {/* Glowing orbs with enhanced glow */}
    <motion.div 
      className="absolute top-1/4 right-10 w-4 h-4 bg-green-400 rounded-full shadow-lg shadow-green-400/50 animate-pulse-glow"
      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
    <motion.div 
      className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50"
      animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 4, repeat: Infinity, delay: 1 }}
    />
    <motion.div 
      className="absolute top-2/3 right-1/4 w-2 h-2 bg-teal-300 rounded-full shadow-lg shadow-teal-300/50"
      animate={{ scale: [1, 2, 1], opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 5, repeat: Infinity, delay: 2 }}
    />
    
    {/* Grid pattern overlay */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
  </div>
);

// 3D Card component
const Card3D = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    setRotateX((y - centerY) / 20);
    setRotateY((centerX - x) / 20);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      className={`${className} transition-all duration-300`}
      style={{
        transformStyle: 'preserve-3d',
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
    >
      {children}
    </motion.div>
  );
};

function App() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waitlistMessage, setWaitlistMessage] = useState<string | null>(null);
  const [isJoiningPresale, setIsJoiningPresale] = useState(false);
  const [presaleStatus, setPresaleStatus] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

  // Enhanced animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 40, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] }
  };

  const fadeInLeft = {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] }
  };

  const fadeInRight = {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] }
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const ecosystemFeatures = [
    {
      icon: <FaGraduationCap className="w-6 h-6" />,
      title: 'Teaching',
      status: 'IN DEVELOPMENT',
      statusColor: 'bg-green-100 text-green-700',
      description: 'Your AI Professor learns your style, remembers your struggles, and adapts lessons just for you. Like having a world-class mentor available 24/7.',
      bullets: ['Personalized learning paths', 'Progress memory retention', 'Adapts to your pace'],
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-500'
    },
    {
      icon: <FaCheckCircle className="w-6 h-6" />,
      title: 'Qualifying',
      status: 'PLANNED',
      statusColor: 'bg-gray-100 text-gray-600',
      description: 'Validate your skills through comprehensive assessments. Your AI Professor ensures you truly master concepts before moving forward.',
      bullets: ['Skill verification system', 'Progress certifications', 'Mastery tracking'],
      bgColor: 'bg-amber-50',
      iconBg: 'bg-amber-500'
    },
    {
      icon: <FaComments className="w-6 h-6" />,
      title: 'Communicating',
      status: 'PLANNED',
      statusColor: 'bg-gray-100 text-gray-600',
      description: 'Your AI Professor cares about you. It celebrates your victories, understands your struggles, and provides emotional support throughout your journey.',
      bullets: ['Emotional intelligence', 'Motivational support', 'Always available'],
      bgColor: 'bg-pink-50',
      iconBg: 'bg-pink-500'
    },
    {
      icon: <FaDatabase className="w-6 h-6" />,
      title: 'Obsidian Base',
      status: 'IN DEVELOPMENT',
      statusColor: 'bg-green-100 text-green-700',
      description: 'Triple knowledge base system: personal vault, AI Professor shared space, and project documentation. All powered by Obsidian for connected thinking.',
      bullets: ['Personal knowledge vault', 'Professor shared notes', 'Project documentation'],
      bgColor: 'bg-gray-100',
      iconBg: 'bg-gray-700'
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
      buttonStyle: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50',
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
      buttonStyle: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50',
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
      buttonStyle: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50',
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
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black relative overflow-hidden">
      {/* Global floating shapes background */}
      <FloatingShapes />
      
      {/* Mesh gradient overlay - Dark theme */}
      <div className="fixed inset-0 mesh-gradient-dark pointer-events-none" />
      
      {/* Header with dark glassmorphism */}
      <header className="sticky top-0 z-50 glass-dark border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span className="text-white font-bold text-lg">N</span>
            </motion.div>
            <span className="font-bold text-xl text-white">Netbit</span>
            <motion.span 
              className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-medium border border-green-500/30"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              IN DEVELOPMENT
            </motion.span>
          </motion.div>
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-gray-400 text-sm hidden sm:block">Auth coming soon</span>
            <motion.button 
              onClick={handleJoinPresale}
              className="relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-medium py-2.5 px-5 rounded-xl text-sm transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Join Pre-Sale</span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity" />
            </motion.button>
          </motion.div>
        </div>
      </header>

      {/* Hero Section with 3D effects */}
      <motion.section
        className="relative px-6 py-16 md:py-28"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <div className="max-w-5xl mx-auto relative">
          {/* Decorative elements */}
          <motion.div 
            className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-full blur-2xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div 
            className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-emerald-500/30 to-teal-500/30 rounded-full blur-2xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />
          
          <Card3D className="relative">
            <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 rounded-3xl p-8 md:p-14 relative overflow-hidden border border-green-500/20 shadow-2xl shadow-green-500/10 backdrop-blur-xl">
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 animate-gradient opacity-50" />
              
              {/* Floating badge */}
              <motion.div 
                className="absolute top-6 right-6"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full font-medium shadow-lg shadow-green-500/30">
                  <FaStar className="inline w-3 h-3 mr-1" />
                  IN DEVELOPMENT
                </span>
              </motion.div>
              
              <motion.div className="text-center mb-10 relative z-10" variants={fadeInUp}>
                <motion.span 
                  className="inline-flex items-center gap-2 text-green-400 text-sm font-medium mb-4 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FaRocket className="w-4 h-4 animate-pulse" />
                  COMING SOON
                </motion.span>
                <motion.p 
                  className="text-green-400 font-semibold mb-3 text-lg"
                  variants={fadeInUp}
                >
                  Your Personal AI Professor
                </motion.p>
                <motion.h1 
                  className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
                  variants={fadeInUp}
                >
                  Everyone Deserves<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">A Great Professor</span>
                </motion.h1>
                <motion.p 
                  className="text-gray-400 max-w-2xl mx-auto mb-10 text-lg leading-relaxed"
                  variants={fadeInUp}
                >
                  Your AI mentor with memory, emotions, and unwavering dedication to your success. Complete development platform with Obsidian, Git server, and Spark infrastructure.
                </motion.p>
                
                <motion.div 
                  className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
                  variants={fadeInUp}
                >
                  <motion.button
                    onClick={handleJoinPresale}
                    disabled={isJoiningPresale}
                    className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white font-semibold py-4 px-8 rounded-xl transition-all disabled:opacity-50 shadow-xl shadow-green-500/25 hover:shadow-green-500/40 overflow-hidden"
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <FaRocket className="w-5 h-5 relative z-10 group-hover:animate-bounce" />
                    <span className="relative z-10">{isJoiningPresale ? 'Processing...' : 'Join Pre-Sale'}</span>
                    <div className="absolute inset-0 animate-shimmer" />
                  </motion.button>
                  <motion.button 
                    className="group inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-semibold py-4 px-8 rounded-xl hover:border-green-500/50 hover:bg-green-500/10 transition-all"
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Watch Demo
                    <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </motion.div>
                
                {presaleStatus && (
                  <motion.p
                    className="text-sm text-gray-300 max-w-md mx-auto break-all bg-gray-800/50 p-3 rounded-lg border border-gray-700"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {presaleStatus}
                  </motion.p>
                )}
              </motion.div>

              {/* Hero Visual - 3D Cards */}
              <motion.div 
                className="flex flex-col md:flex-row items-center justify-center gap-8"
                variants={fadeInUp}
              >
                <motion.div 
                  className="flex items-center gap-4"
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div 
                    className="w-24 h-24 bg-gradient-to-br from-green-500/80 to-emerald-600/80 rounded-3xl flex items-center justify-center shadow-2xl shadow-green-500/30 backdrop-blur-sm border border-green-400/20"
                    animate={{ rotate: [0, 5, 0, -5, 0] }}
                    transition={{ duration: 6, repeat: Infinity }}
                  >
                    <motion.div 
                      className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg shadow-green-400/30"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  <motion.div 
                    className="w-18 h-18 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center shadow-lg p-4 border border-green-400/20 backdrop-blur-sm"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  >
                    <FaUsers className="w-8 h-8 text-green-400" />
                  </motion.div>
                </motion.div>
                <div className="flex flex-col gap-3">
                  {['Remembers your progress', 'Adapts to your style', 'Celebrates your wins'].map((text, idx) => (
                    <motion.div 
                      key={idx}
                      className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-full px-5 py-3 border border-gray-700/50"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + idx * 0.15 }}
                      whileHover={{ scale: 1.05, x: 5, borderColor: 'rgba(34, 197, 94, 0.3)' }}
                    >
                      <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                        <FaCheck className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-300">{text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </Card3D>
        </div>
      </motion.section>

      {/* 3D Product Showcase - Spline Ready Section */}
      <motion.section
        className="px-6 py-20 md:py-32 relative overflow-hidden"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        {/* Aurora background - Dark theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-black" />
        <div className="absolute inset-0 aurora-bg-dark" />
        
        {/* Animated particles */}
        <div className="particles-container">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-green-400/60 rounded-full shadow-lg shadow-green-400/50"
              style={{
                left: `${10 + (i * 7)}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -40, 0],
                x: [0, 20, 0],
                scale: [1, 1.5, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 4 + (i % 3),
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <motion.span 
              className="inline-flex items-center gap-2 text-xs bg-green-500/10 text-green-400 px-4 py-2 rounded-full font-medium mb-4 border border-green-500/30 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <FaCube className="w-3 h-3" />
              3D PRODUCT SHOWCASE
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Experience <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 animate-text-gradient">Netbit</span> In 3D
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Interactive 3D visualizations of our platform. Explore the future of AI-powered learning.
            </p>
          </motion.div>

          {/* Main 3D Showcase Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* AI Professor 3D Model Placeholder */}
            <Card3D>
              <motion.div 
                className="spline-container rounded-3xl border border-green-500/20 shadow-2xl shadow-green-500/10 relative group bg-gray-900/50 backdrop-blur-xl"
                variants={fadeInLeft}
                whileHover={{ scale: 1.02 }}
              >
                {/* Spline embed placeholder - replace with actual Spline embed */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Animated 3D placeholder */}
                  <div className="scene-3d relative w-48 h-48">
                    {/* Central orb */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full animate-glow-pulse shadow-2xl shadow-green-500/50"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 180, 360]
                      }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                    
                    {/* Orbiting elements */}
                    {[0, 120, 240].map((angle, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-8 h-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg border border-green-500/30"
                        style={{
                          top: '50%',
                          left: '50%',
                          marginTop: '-16px',
                          marginLeft: '-16px',
                        }}
                        animate={{
                          rotate: [angle, angle + 360],
                        }}
                        transition={{
                          duration: 6 + i,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <motion.div
                          style={{
                            transform: `translateX(80px)`,
                          }}
                          className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg shadow-green-500/30 flex items-center justify-center"
                        >
                          {i === 0 && <FaGraduationCap className="w-4 h-4 text-white" />}
                          {i === 1 && <FaDatabase className="w-4 h-4 text-white" />}
                          {i === 2 && <FaRocket className="w-4 h-4 text-white" />}
                        </motion.div>
                      </motion.div>
                    ))}
                    
                    {/* Inner glow */}
                    <div className="absolute inset-4 bg-gradient-to-br from-white/20 to-transparent rounded-full" />
                  </div>
                </div>
                
                {/* Label */}
                <div className="absolute bottom-6 left-6 right-6">
                  <motion.div 
                    className="glass rounded-xl p-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                  >
                    <h3 className="font-bold text-gray-900 mb-1">AI Professor</h3>
                    <p className="text-sm text-gray-600">Interactive learning companion with memory & emotions</p>
                    <span className="text-xs text-green-600 font-medium mt-2 inline-block">
                      {/* TODO: Replace with Spline scene URL */}
                      🎨 Spline: "Friendly AI robot professor, isometric, green glow, floating books"
                    </span>
                  </motion.div>
                </div>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              </motion.div>
            </Card3D>

            {/* Obsidian Knowledge Base 3D Placeholder */}
            <Card3D>
              <motion.div 
                className="spline-container rounded-3xl border border-gray-200/50 shadow-2xl relative group"
                style={{ background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.05) 0%, rgba(17, 24, 39, 0.1) 100%)' }}
                variants={fadeInRight}
                whileHover={{ scale: 1.02 }}
              >
                {/* Knowledge graph visualization placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-64 h-64">
                    {/* Central node */}
                    <motion.div
                      className="absolute top-1/2 left-1/2 w-16 h-16 -mt-8 -ml-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl shadow-2xl flex items-center justify-center"
                      animate={{ rotate: [0, 5, 0, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <FaDatabase className="w-8 h-8 text-green-400" />
                    </motion.div>
                    
                    {/* Connected nodes */}
                    {[
                      { x: -80, y: -60, icon: '📝', delay: 0 },
                      { x: 80, y: -60, icon: '🧠', delay: 0.5 },
                      { x: -80, y: 60, icon: '📚', delay: 1 },
                      { x: 80, y: 60, icon: '💡', delay: 1.5 },
                      { x: 0, y: -90, icon: '🔗', delay: 2 },
                      { x: 0, y: 90, icon: '⚡', delay: 2.5 },
                    ].map((node, i) => (
                      <motion.div
                        key={i}
                        className="absolute top-1/2 left-1/2 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-lg"
                        style={{
                          marginTop: '-20px',
                          marginLeft: '-20px',
                          x: node.x,
                          y: node.y,
                        }}
                        animate={{
                          scale: [1, 1.2, 1],
                          y: [node.y, node.y - 10, node.y],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: node.delay,
                        }}
                      >
                        {node.icon}
                      </motion.div>
                    ))}
                    
                    {/* Connection lines (SVG) */}
                    <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                      {[
                        { x1: 128, y1: 128, x2: 48, y2: 68 },
                        { x1: 128, y1: 128, x2: 208, y2: 68 },
                        { x1: 128, y1: 128, x2: 48, y2: 188 },
                        { x1: 128, y1: 128, x2: 208, y2: 188 },
                        { x1: 128, y1: 128, x2: 128, y2: 38 },
                        { x1: 128, y1: 128, x2: 128, y2: 218 },
                      ].map((line, i) => (
                        <motion.line
                          key={i}
                          x1={line.x1}
                          y1={line.y1}
                          x2={line.x2}
                          y2={line.y2}
                          stroke="rgba(34, 197, 94, 0.3)"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 2, delay: i * 0.2 }}
                        />
                      ))}
                    </svg>
                  </div>
                </div>
                
                {/* Label */}
                <div className="absolute bottom-6 left-6 right-6">
                  <motion.div 
                    className="glass-dark rounded-xl p-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                  >
                    <h3 className="font-bold text-white mb-1">Obsidian Knowledge Base</h3>
                    <p className="text-sm text-gray-300">Connected thinking with triple vault system</p>
                    <span className="text-xs text-green-400 font-medium mt-2 inline-block">
                      🎨 Spline: "3D knowledge graph, floating nodes, dark theme, green connections"
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            </Card3D>
          </div>

          {/* Interactive Device Farm Visualization */}
          <Card3D className="w-full">
            <motion.div 
              className="relative rounded-3xl overflow-hidden border border-green-200/30 shadow-2xl"
              style={{ 
                background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.9) 100%)',
                minHeight: '400px'
              }}
              variants={fadeInUp}
            >
              {/* Cyber grid background */}
              <div className="absolute inset-0 cyber-grid opacity-30" />
              
              {/* Glow effects */}
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
              
              {/* Content */}
              <div className="relative z-10 p-8 md:p-12">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                  {/* Left: Device visualization */}
                  <div className="flex-1 flex justify-center">
                    <div className="relative">
                      {/* Central server */}
                      <motion.div
                        className="w-24 h-32 bg-gradient-to-b from-gray-700 to-gray-800 rounded-xl shadow-2xl border border-gray-600 flex flex-col items-center justify-center gap-2"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        <div className="w-16 h-2 bg-green-500 rounded animate-pulse" />
                        <div className="w-16 h-2 bg-green-400 rounded animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <div className="w-16 h-2 bg-emerald-500 rounded animate-pulse" style={{ animationDelay: '0.4s' }} />
                        <FaTerminal className="w-6 h-6 text-green-400 mt-2" />
                      </motion.div>
                      
                      {/* Connected devices */}
                      {[
                        { x: -120, y: -40, label: 'Raspberry Pi' },
                        { x: 120, y: -40, label: 'Orange Pi' },
                        { x: -120, y: 80, label: 'IoT Device' },
                        { x: 120, y: 80, label: 'Edge Server' },
                      ].map((device, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg shadow-lg border border-gray-500 flex items-center justify-center"
                          style={{
                            top: '50%',
                            left: '50%',
                            marginTop: '-32px',
                            marginLeft: '-32px',
                            x: device.x,
                            y: device.y,
                          }}
                          animate={{
                            scale: [1, 1.05, 1],
                            boxShadow: [
                              '0 0 0 rgba(34, 197, 94, 0)',
                              '0 0 20px rgba(34, 197, 94, 0.5)',
                              '0 0 0 rgba(34, 197, 94, 0)',
                            ],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.5,
                          }}
                        >
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                        </motion.div>
                      ))}
                      
                      {/* Connection lines */}
                      <svg className="absolute inset-0 w-full h-full" style={{ left: '-150px', top: '-50px', width: '400px', height: '250px' }}>
                        {[
                          { x1: 200, y1: 125, x2: 80, y2: 85 },
                          { x1: 200, y1: 125, x2: 320, y2: 85 },
                          { x1: 200, y1: 125, x2: 80, y2: 205 },
                          { x1: 200, y1: 125, x2: 320, y2: 205 },
                        ].map((line, i) => (
                          <motion.line
                            key={i}
                            x1={line.x1}
                            y1={line.y1}
                            x2={line.x2}
                            y2={line.y2}
                            stroke="rgba(34, 197, 94, 0.6)"
                            strokeWidth="2"
                            initial={{ pathLength: 0 }}
                            animate={{ 
                              pathLength: [0, 1, 1],
                              opacity: [0.3, 1, 0.3],
                            }}
                            transition={{ 
                              duration: 3, 
                              repeat: Infinity,
                              delay: i * 0.3,
                            }}
                          />
                        ))}
                      </svg>
                    </div>
                  </div>
                  
                  {/* Right: Info */}
                  <div className="flex-1 text-center lg:text-left">
                    <motion.span 
                      className="inline-flex items-center gap-2 text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-medium mb-4"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <FaBolt className="w-3 h-3" />
                      SPARK DEPLOYMENT
                    </motion.span>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                      Deploy to <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Unlimited Devices</span>
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Visualize your entire device farm in real-time. One-command deployment to Raspberry Pi, Orange Pi, and ARM devices.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                      {['Real-time Status', 'Auto-scaling', 'Edge Computing'].map((tag, i) => (
                        <motion.span
                          key={i}
                          className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-full text-sm border border-gray-600"
                          whileHover={{ scale: 1.1, borderColor: 'rgba(34, 197, 94, 0.5)' }}
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                    <p className="text-xs text-green-400 font-medium mt-6">
                      🎨 Spline: "3D server rack with connected IoT devices, green data streams, dark futuristic theme"
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </Card3D>

          {/* Spline Integration Instructions */}
          <motion.div 
            className="mt-12 text-center"
            variants={fadeInUp}
          >
            <div className="glass rounded-2xl p-6 max-w-2xl mx-auto border border-green-200/30">
              <h4 className="font-bold text-gray-900 mb-2">🚀 Ready for Spline Integration</h4>
              <p className="text-sm text-gray-600 mb-4">
                These placeholders are designed to be replaced with Spline 3D scenes. Each section includes suggested prompts for creating matching 3D models.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['@splinetool/react-spline', 'Interactive 3D', 'WebGL Optimized'].map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Platform Features - Ecosystem */}
      <motion.section
        className="px-6 py-20 md:py-32 relative"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        {/* Section background decoration - Dark theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-gray-900 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-transparent to-transparent" />
        
        <div className="max-w-7xl mx-auto relative">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <motion.span 
              className="inline-flex items-center gap-2 text-xs bg-green-500/10 text-green-400 px-4 py-2 rounded-full font-medium mb-4 border border-green-500/30"
              whileHover={{ scale: 1.05 }}
            >
              <FaCube className="w-3 h-3" />
              PLATFORM FEATURES
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Complete Development <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Ecosystem</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              AI Professor, Obsidian knowledge base, Git server, and Spark infrastructure. Everything you need from learning to deployment.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {ecosystemFeatures.map((feature, index) => (
              <Card3D key={index}>
                <motion.div
                  className="group bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-800 hover:border-green-500/30 shadow-xl shadow-black/20 hover:shadow-green-500/10 transition-all relative overflow-hidden"
                  variants={index % 2 === 0 ? fadeInLeft : fadeInRight}
                  whileHover={{ y: -8 }}
                >
                  {/* Card glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-transparent to-emerald-500/0 group-hover:from-green-500/5 group-hover:to-emerald-500/5 transition-all duration-500 rounded-3xl" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <motion.div 
                        className="bg-gray-800/80 rounded-2xl p-5 inline-block shadow-lg border border-gray-700/50"
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`${feature.iconBg} text-white p-3 rounded-xl shadow-lg shadow-green-500/20`}>
                            {React.cloneElement(feature.icon, { className: 'w-7 h-7' })}
                          </div>
                          {index === 0 && (
                            <motion.div 
                              className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center border border-green-500/30"
                              animate={{ rotate: [0, 10, 0] }}
                              transition={{ duration: 3, repeat: Infinity }}
                            >
                              <FaUsers className="w-6 h-6 text-green-400" />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                      <motion.span 
                        className={`text-xs px-3 py-1.5 rounded-full font-medium ${feature.status === 'IN DEVELOPMENT' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-700/50 text-gray-400 border border-gray-600'}`}
                        whileHover={{ scale: 1.1 }}
                      >
                        {feature.status}
                      </motion.span>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`${feature.iconBg} text-white p-2 rounded-lg shadow-md shadow-green-500/20`}>
                        {React.cloneElement(feature.icon, { className: 'w-5 h-5' })}
                      </div>
                      <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                    </div>
                    
                    <p className="text-gray-400 mb-6 leading-relaxed">{feature.description}</p>
                    
                    <ul className="space-y-3">
                      {feature.bullets.map((bullet, bulletIndex) => (
                        <motion.li 
                          key={bulletIndex} 
                          className="flex items-center gap-3 text-gray-400"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: bulletIndex * 0.1 }}
                        >
                          <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30">
                            <FaCheck className="w-2.5 h-2.5 text-white" />
                          </div>
                          {bullet}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </Card3D>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Spark CLI Section */}
      <motion.section
        className="px-6 py-20 md:py-32 relative overflow-hidden"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-900/20 via-transparent to-transparent" />
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.3) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <motion.span 
              className="inline-flex items-center gap-2 text-xs bg-green-500/20 text-green-400 px-4 py-2 rounded-full font-medium mb-4 border border-green-500/30"
              whileHover={{ scale: 1.05 }}
            >
              <FaTerminal className="w-3 h-3" />
              SPARK CLI
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Deploy At Scale With <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Spark</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Rust-powered CLI for mass device deployment. Perfect for IoT projects, Raspberry Pi farms, and edge computing at scale.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Terminal Mockup with 3D effect */}
            <Card3D>
              <motion.div 
                className="glass-dark rounded-2xl p-8 font-mono text-sm shadow-2xl border border-gray-700/50 relative overflow-hidden"
                variants={fadeInLeft}
              >
                {/* Terminal header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <motion.div 
                      className="w-3 h-3 rounded-full bg-red-500"
                      whileHover={{ scale: 1.3 }}
                    />
                    <motion.div 
                      className="w-3 h-3 rounded-full bg-yellow-500"
                      whileHover={{ scale: 1.3 }}
                    />
                    <motion.div 
                      className="w-3 h-3 rounded-full bg-green-500"
                      whileHover={{ scale: 1.3 }}
                    />
                  </div>
                  <span className="text-gray-500 text-xs">spark-cli v2.0</span>
                </div>
                
                {/* Terminal content with typing effect */}
                <div className="space-y-3 text-gray-300">
                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="text-green-400">$</span> spark unique share ai-assistant-v2
                  </motion.p>
                  <motion.p 
                    className="text-gray-500"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Generated code: <span className="text-emerald-400 font-bold">755482</span>
                  </motion.p>
                  <motion.p 
                    className="text-gray-500"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    Listening for connections...
                  </motion.p>
                  {['Device #1', 'Device #2', 'Device #3'].map((device, idx) => (
                    <motion.p 
                      key={idx}
                      className="text-green-400 flex items-center gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + idx * 0.2 }}
                    >
                      <FaCheck className="w-3 h-3" />
                      {device} connected
                    </motion.p>
                  ))}
                </div>
                
                {/* Glow effect */}
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-green-500/20 rounded-full blur-3xl" />
              </motion.div>
            </Card3D>

            {/* Features */}
            <motion.div variants={fadeInRight}>
              <h3 className="text-2xl font-bold text-white mb-6">Perfect for hardware entrepreneurs</h3>
              <p className="text-gray-400 mb-6 leading-relaxed text-lg">
                Deploy your packages from Netbit repository to multiple ARM devices (Raspberry Pi, Orange Pi, and similar) with a single command. Track device status, session duration, and manage deployments from your PC.
              </p>
              <p className="text-gray-400 mb-8 flex items-center gap-2">
                <FaBolt className="text-yellow-400" />
                Built with Rust for performance and reliability.
              </p>
              <ul className="space-y-4">
                {['One-command deployment', 'Real-time device monitoring', 'Session tracking & analytics'].map((text, idx) => (
                  <motion.li 
                    key={idx}
                    className="flex items-center gap-3 text-gray-300"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    whileHover={{ x: 5 }}
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                      <FaCheck className="w-3 h-3 text-white" />
                    </div>
                    {text}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Infrastructure Section */}
      <motion.section
        className="px-6 py-20 md:py-32 relative"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        {/* Dark background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-black" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <motion.span 
              className="inline-flex items-center gap-2 text-xs bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full font-medium mb-4 border border-orange-500/30"
              whileHover={{ scale: 1.05 }}
            >
              <FaGithub className="w-3 h-3" />
              INFRASTRUCTURE
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Git Server + <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Project Management</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Self-hosted Git server with integrated project management. Everything you need from day one, scales as you grow.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {infrastructureFeatures.map((feature, index) => (
              <Card3D key={index}>
                <motion.div
                  className="group bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-800 hover:border-green-500/30 shadow-xl shadow-black/20 hover:shadow-green-500/10 transition-all text-center relative overflow-hidden h-full"
                  variants={fadeInUp}
                  whileHover={{ y: -10 }}
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                  
                  <motion.div 
                    className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-gray-700/50 relative z-10"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-3 relative z-10">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed relative z-10">{feature.description}</p>
                </motion.div>
              </Card3D>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section
        className="px-6 py-20 md:py-32 relative overflow-hidden"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        {/* Background decorations - Dark theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-gray-900" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <motion.span 
              className="inline-flex items-center gap-2 text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full font-medium mb-4 shadow-lg shadow-green-500/25"
              whileHover={{ scale: 1.05 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FaRocket className="w-3 h-3" />
              PRE-SALE PRICING
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Everyone Deserves <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Excellence</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Affordable access to world-class AI mentorship. Lock in pre-sale pricing before we launch.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, index) => (
              <Card3D key={index}>
                <motion.div
                  className={`relative bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border ${plan.highlight ? 'border-green-500/50 shadow-2xl shadow-green-500/20' : 'border-gray-800 shadow-xl'} h-full`}
                  variants={fadeInUp}
                  whileHover={{ y: -10 }}
                >
                  {plan.popular && (
                    <motion.div 
                      className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-green-500/30 flex items-center gap-1">
                        <FaStar className="w-3 h-3" />
                        POPULAR
                      </span>
                    </motion.div>
                  )}
                  
                  <h3 className="text-xl font-bold text-white mb-3">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-gray-500 line-through">{plan.originalPrice}</span>
                      <motion.span 
                        className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-bold border border-green-500/30"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {plan.discount}
                      </motion.span>
                    </div>
                  )}
                  <p className="text-gray-400 mb-6">{plan.description}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li 
                        key={featureIndex} 
                        className="flex items-center gap-3 text-gray-400"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: featureIndex * 0.1 }}
                      >
                        <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/20">
                          <FaCheck className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  
                  <motion.button 
                    onClick={plan.name === 'Beginner Developer' ? handleJoinPresale : undefined}
                    className={`w-full py-3.5 px-4 rounded-xl font-semibold transition-all ${plan.highlight ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40' : 'border border-gray-700 text-gray-300 hover:border-green-500/50 hover:bg-green-500/10'}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {plan.buttonText}
                  </motion.button>
                  <p className={`text-xs mt-4 text-center font-bold ${plan.highlight ? 'text-green-400' : 'text-gray-500'}`}>{plan.available}</p>
                </motion.div>
              </Card3D>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Waitlist Section */}
      <motion.section
        className="px-6 py-20 md:py-32 relative"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        {/* Dark background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-black" />
        
        <div className="max-w-5xl mx-auto relative">
          {/* Decorative elements */}
          <motion.div 
            className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div 
            className="absolute -bottom-10 -right-10 w-48 h-48 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />
          
          <Card3D>
            <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden border border-green-500/20 shadow-2xl shadow-green-500/10 backdrop-blur-xl">
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-teal-500/5 animate-gradient" />
              
              <motion.div variants={fadeInUp} className="relative z-10">
                <motion.span 
                  className="inline-flex items-center gap-2 text-green-400 text-sm font-medium mb-6 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/30"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FaRocket className="w-4 h-4 animate-bounce" />
                  JOIN WAITLIST
                </motion.span>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                  Be Among <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">The First</span>
                </h2>
                <p className="text-gray-400 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                  Join the waitlist for early access when we launch. Lock in exclusive pre-sale pricing and be notified first when platform goes live.
                </p>
                
                <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <motion.input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="px-6 py-4 rounded-xl border border-gray-700 bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-500 w-full sm:w-96 shadow-lg transition-all"
                    whileFocus={{ scale: 1.02 }}
                  />
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white font-semibold py-4 px-8 rounded-xl transition-all disabled:opacity-50 shadow-xl shadow-green-500/25 hover:shadow-green-500/40 overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaRocket className="w-5 h-5 group-hover:animate-bounce" />
                    {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                    <div className="absolute inset-0 animate-shimmer" />
                  </motion.button>
                </form>
                
                {waitlistMessage && (
                  <motion.p
                    className="text-green-400 font-medium mb-6 bg-green-500/10 px-4 py-2 rounded-lg inline-block border border-green-500/30"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {waitlistMessage}
                  </motion.p>
                )}
                
                <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400">
                  {['No commitment required', 'Early access notification', 'Exclusive pre-sale pricing'].map((text, idx) => (
                    <motion.span 
                      key={idx}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                        <FaCheck className="w-2.5 h-2.5 text-white" />
                      </div>
                      {text}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </div>
          </Card3D>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        className="px-6 py-20 md:py-32 relative overflow-hidden"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        {/* Background - Dark theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-gray-900" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <motion.span 
              className="inline-flex items-center gap-2 text-xs bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full font-medium mb-4 border border-amber-500/30"
              whileHover={{ scale: 1.05 }}
            >
              FAQ
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Questions</span>
            </h2>
            <p className="text-gray-400 text-lg">Everything you need to know about Netbit platform</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <Card3D key={index}>
                <motion.div
                  className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 hover:border-green-500/30 shadow-xl hover:shadow-green-500/10 transition-all h-full"
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="flex items-start gap-4 w-full text-left"
                  >
                    <motion.div 
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                        index % 2 === 0 ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-green-500/30' : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-500/30'
                      }`}
                      whileHover={{ rotate: 10, scale: 1.1 }}
                    >
                      <span className="text-lg font-bold">?</span>
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-white mb-2 text-lg">{faq.question}</h3>
                      <p className={`text-gray-400 leading-relaxed ${openFaq === index ? '' : 'line-clamp-2'}`}>
                        {faq.answer}
                      </p>
                    </div>
                  </button>
                </motion.div>
              </Card3D>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer - Dark theme */}
      <footer className="px-6 py-16 relative overflow-hidden">
        {/* Footer background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-16">
            {/* Logo & Info */}
            <motion.div 
              className="md:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-4 mb-6">
                <motion.div 
                  className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-green-500/30"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <span className="text-white font-bold text-2xl">N</span>
                </motion.div>
                <div>
                  <span className="font-bold text-2xl text-white">Netbit</span>
                  <p className="text-gray-500">Everyone deserves a great professor</p>
                </div>
              </div>
              <p className="text-gray-500 mb-2">Created by Veloro</p>
              <p className="text-gray-500 mb-2">Special thanks to Kazilsky · 2025</p>
              <p className="text-gray-500">general@veloro.su</p>
            </motion.div>

            {/* Platform */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h4 className="font-bold text-white mb-6">Platform</h4>
              <ul className="space-y-3">
                {footerLinks.platform.map((link, index) => (
                  <motion.li 
                    key={index} 
                    className="flex items-center gap-2"
                    whileHover={{ x: 5 }}
                  >
                    <span className="text-gray-400 hover:text-green-400 cursor-pointer transition-colors">{link.name}</span>
                    <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full border border-gray-700">{link.badge}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Company */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="font-bold text-white mb-6">Company</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link, index) => (
                  <motion.li 
                    key={index} 
                    className="flex items-center gap-2"
                    whileHover={{ x: 5 }}
                  >
                    <span className="text-gray-400 hover:text-green-400 cursor-pointer transition-colors">{link.name}</span>
                    <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full border border-gray-700">{link.badge}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Resources */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h4 className="font-bold text-white mb-6">Resources</h4>
              <ul className="space-y-3">
                {footerLinks.resources.map((link, index) => (
                  <motion.li 
                    key={index} 
                    className="flex items-center gap-2"
                    whileHover={{ x: 5 }}
                  >
                    <span className="text-gray-400 hover:text-green-400 cursor-pointer transition-colors">{link.name}</span>
                    <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full border border-gray-700">{link.badge}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div 
            className="border-t border-gray-800 pt-10 flex flex-col md:flex-row items-center justify-between gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-500">&copy; {new Date().getFullYear()} Veloro. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <motion.button 
                className="text-gray-400 hover:text-green-400 transition-colors font-medium"
                whileHover={{ scale: 1.05 }}
              >
                DevPath Pro
              </motion.button>
              <motion.button 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 px-5 rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login to Subframe
                <FaArrowRight className="w-3 h-3" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}

export default App; 