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
  FaTerminal,
  FaCheck,
  FaArrowRight,
  FaRocket
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Netbit</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">IN DEVELOPMENT</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm hidden sm:block">Auth coming soon</span>
            <button 
              onClick={handleJoinPresale}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
            >
              Join Pre-Sale
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section
        className="relative px-6 py-16 md:py-24"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">IN DEVELOPMENT</span>
            </div>
            
            <motion.div className="text-center mb-8" variants={fadeInUp}>
              <span className="inline-flex items-center gap-2 text-green-600 text-sm font-medium mb-4">
                <FaRocket className="w-4 h-4" />
                COMING SOON
              </span>
              <p className="text-green-600 font-medium mb-2">Your Personal AI Professor</p>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Everyone Deserves<br />A Great Professor
              </h1>
              <p className="text-gray-600 max-w-xl mx-auto mb-8">
                Your AI mentor with memory, emotions, and unwavering dedication to your success. Complete development platform with Obsidian, Git server, and Spark infrastructure.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button
                  onClick={handleJoinPresale}
                  disabled={isJoiningPresale}
                  className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                >
                  <FaRocket className="w-4 h-4" />
                  {isJoiningPresale ? 'Processing...' : 'Join Pre-Sale'}
                </button>
                <button className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors">
                  Watch Demo
                  <FaArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              {presaleStatus && (
                <motion.p
                  className="text-sm text-gray-700 max-w-md mx-auto break-all"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {presaleStatus}
                </motion.p>
              )}
            </motion.div>

            {/* Hero Visual */}
            <motion.div 
              className="flex flex-col md:flex-row items-center justify-center gap-8"
              variants={fadeInUp}
            >
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-green-200 rounded-2xl flex items-center justify-center">
                  <div className="w-10 h-10 bg-green-500 rounded-lg"></div>
                </div>
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                  <FaUsers className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
                  <FaCheck className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700">Remembers your progress</span>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
                  <FaCheck className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700">Adapts to your style</span>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
                  <FaCheck className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700">Celebrates your wins</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Platform Features - Ecosystem */}
      <motion.section
        className="px-6 py-16 md:py-24"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <span className="inline-block text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium mb-4">PLATFORM FEATURES</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete Development Ecosystem
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              AI Professor, Obsidian knowledge base, Git server, and Spark infrastructure. Everything you need from learning to deployment.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ecosystemFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow"
                variants={fadeInUp}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`${feature.bgColor} rounded-2xl p-4 inline-block`}>
                    <div className="flex items-center gap-3">
                      <div className={`${feature.iconBg} text-white p-2 rounded-lg`}>
                        {feature.icon}
                      </div>
                      {index === 0 && (
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <FaUsers className="w-5 h-5 text-green-600" />
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs ${feature.statusColor} px-2 py-1 rounded-full font-medium`}>
                    {feature.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className={`${feature.iconBg} text-white p-1.5 rounded`}>
                    {React.cloneElement(feature.icon, { className: 'w-4 h-4' })}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                
                <ul className="space-y-2">
                  {feature.bullets.map((bullet, bulletIndex) => (
                    <li key={bulletIndex} className="flex items-center gap-2 text-sm text-gray-600">
                      <FaCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Spark CLI Section */}
      <motion.section
        className="px-6 py-16 md:py-24 bg-gray-50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <span className="inline-block text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-medium mb-4">
              <FaTerminal className="inline w-3 h-3 mr-1" />
              SPARK CLI
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Deploy At Scale With Spark
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Rust-powered CLI for mass device deployment. Perfect for IoT projects, Raspberry Pi farms, and edge computing at scale.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Terminal Mockup */}
            <motion.div 
              className="bg-gray-900 rounded-xl p-6 font-mono text-sm"
              variants={fadeInUp}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="space-y-2 text-gray-300">
                <p><span className="text-green-400">$</span> spark unique share ai-assistant-v2</p>
                <p className="text-gray-500">Generated code: 755482</p>
                <p className="text-gray-500">Listening for connections...</p>
                <p className="text-green-400">✓ Device #1 connected</p>
                <p className="text-green-400">✓ Device #2 connected</p>
                <p className="text-green-400">✓ Device #3 connected</p>
              </div>
            </motion.div>

            {/* Features */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Perfect for hardware entrepreneurs</h3>
              <p className="text-gray-600 mb-6">
                Deploy your packages from Netbit repository to multiple ARM devices (Raspberry Pi, Orange Pi, and similar) with a single command. Track device status, session duration, and manage deployments from your PC.
              </p>
              <p className="text-gray-600 mb-6">Built with Rust for performance and reliability.</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-600">
                  <FaCheck className="w-4 h-4 text-green-500" />
                  One-command deployment
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <FaCheck className="w-4 h-4 text-green-500" />
                  Real-time device monitoring
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <FaCheck className="w-4 h-4 text-green-500" />
                  Session tracking & analytics
                </li>
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
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <span className="inline-block text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium mb-4">
              <FaGithub className="inline w-3 h-3 mr-1" />
              INFRASTRUCTURE
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Git Server + Project Management
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Self-hosted Git server with integrated project management. Everything you need from day one, scales as you grow.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {infrastructureFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow text-center"
                variants={fadeInUp}
              >
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section
        className="px-6 py-16 md:py-24 bg-gray-50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <span className="inline-block text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium mb-4">
              <FaRocket className="inline w-3 h-3 mr-1" />
              PRE-SALE PRICING
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everyone Deserves Excellence
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Affordable access to world-class AI mentorship. Lock in pre-sale pricing before we launch.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                className={`bg-white rounded-2xl p-6 border-2 ${plan.highlight ? 'border-green-500 shadow-lg' : 'border-gray-100'} relative`}
                variants={fadeInUp}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">POPULAR</span>
                  </div>
                )}
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                {plan.originalPrice && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-400 line-through">{plan.originalPrice}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{plan.discount}</span>
                  </div>
                )}
                <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2 text-sm text-gray-600">
                      <FaCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={plan.name === 'Beginner Developer' ? handleJoinPresale : undefined}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${plan.buttonStyle}`}
                >
                  {plan.buttonText}
                </button>
                <p className={`text-xs ${plan.availableColor} mt-3 text-center font-medium`}>{plan.available}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Waitlist Section */}
      <motion.section
        className="px-6 py-16 md:py-24"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-3xl p-8 md:p-12 text-center">
            <motion.div variants={fadeInUp}>
              <span className="inline-flex items-center gap-2 text-green-600 text-sm font-medium mb-4">
                <FaRocket className="w-4 h-4" />
                JOIN WAITLIST
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Be Among The First
              </h2>
              <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                Join the waitlist for early access when we launch. Lock in exclusive pre-sale pricing and be notified first when platform goes live.
              </p>
              
              <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
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
                  className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                >
                  <FaRocket className="w-4 h-4" />
                  {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                </button>
              </form>
              
              {waitlistMessage && (
                <motion.p
                  className="text-green-700 font-medium mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {waitlistMessage}
                </motion.p>
              )}
              
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
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
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        className="px-6 py-16 md:py-24 bg-gray-50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <span className="inline-block text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium mb-4">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">Everything you need to know about Netbit platform</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 border border-gray-100"
                variants={fadeInUp}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex items-start gap-3 w-full text-left"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    index % 2 === 0 ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    <span className="text-lg">?</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className={`text-gray-600 text-sm ${openFaq === index ? '' : 'line-clamp-2'}`}>
                      {faq.answer}
                    </p>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
            {/* Logo & Info */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">N</span>
                </div>
                <div>
                  <span className="font-bold text-lg text-gray-900">Netbit</span>
                  <p className="text-sm text-gray-500">Everyone deserves a great professor</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-2">Created by Veloro</p>
              <p className="text-sm text-gray-500 mb-2">Special thanks to Kazilsky · 2025</p>
              <p className="text-sm text-gray-500">general@veloro.su</p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Platform</h4>
              <ul className="space-y-2">
                {footerLinks.platform.map((link, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{link.name}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{link.badge}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2">
                {footerLinks.company.map((link, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{link.name}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{link.badge}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
              <ul className="space-y-2">
                {footerLinks.resources.map((link, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{link.name}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{link.badge}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Veloro. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <button className="text-sm text-gray-600 hover:text-gray-900">DevPath Pro</button>
              <button className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm py-2 px-4 rounded-lg">
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