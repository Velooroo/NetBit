import React from 'react';
import SplineEmbed from '../components/SplineEmbed';
import FeatureCard from '../components/FeatureCard';

const features = [
  { title: 'Teaching', text: 'Your AI Professor learns your style, remembers struggles and adapts lessons just for you.', tag: 'IN DEVELOPMENT' },
  { title: 'Qualifying', text: 'Validate skills through assessments and progress tracking.', tag: 'PLANNED' },
  { title: 'Communicating', text: 'Emotional support, motivation, always available.', tag: 'PLANNED' },
  { title: 'Obsidian Base', text: 'Personal knowledge vault, shared professor notes and project documentation.', tag: 'READY' },
];

const pricing = [
  { title: 'Free Tier', price: '$0', note: 'Start learning with your AI Professor' },
  { title: 'Beginner Developer', price: '$8', note: 'Perfect for aspiring developers', featured: true },
  { title: 'Professional', price: '$25', note: 'For serious developers' },
  { title: 'Enterprise', price: 'Grant', note: 'Validated teams & companies' },
];

const faqs = [
  { q: 'When will Netbit launch?', a: 'We\'re currently in active development. Join the waitlist to get notified when we launch early access.' },
  { q: 'What makes this different?', a: 'Your AI Professor has memory and emotions — it remembers your progress and truly adapts to your needs.' },
  { q: 'How does Enterprise hiring work?', a: 'Enterprise subscribers connect with validated developers through the platform.' },
  { q: 'What can I deploy with Spark?', a: 'Spark is perfect for deploying to multiple ARM devices (Raspberry Pi, Orange Pi, etc.).' },
];

const LandingPage: React.FC = () => {
  const sceneUrl = ''; // leave empty to show placeholder/fallback
  const fallback = '/spline-fallback.png';

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 antialiased">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">N</div>
            <span className="text-sm font-medium text-slate-600">Netbit <span className="ml-2 text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">IN DEVELOPMENT</span></span>
          </div>
          <div className="flex items-center gap-3">
            <a className="text-sm text-slate-600" href="#">Auth coming soon</a>
            <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">Join Pre-Sale</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* HERO */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-3 mb-4">
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-semibold">COMING SOON</span>
                <span className="text-xs text-slate-400">Your Personal AI Professor</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">Everyone Deserves A Great Professor</h1>
              <p className="text-slate-600 max-w-xl mb-6">Your AI mentor with memory, emotions, and unwavering dedication to your success. Complete development platform with Obsidian, Git server, and Spark infrastructure.</p>

              <div className="flex items-center gap-4">
                <button className="bg-emerald-500 text-white px-5 py-3 rounded-lg font-semibold shadow">Join Pre-Sale</button>
                <button className="bg-white border border-slate-200 px-4 py-3 rounded-lg text-slate-700">Watch Demo</button>
              </div>
            </div>

            <div>
              {/* 3D area — placeholder by default */}
              <div className="rounded-xl overflow-hidden border border-slate-100 shadow-lg bg-gradient-to-b from-emerald-50 to-white">
                <div className="w-full h-[360px]">
                  <SplineEmbed sceneUrl={sceneUrl} fallbackImage={fallback} className="w-full h-full" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES grid */}
        <section className="mt-12">
          <div className="text-center mb-8">
            <div className="text-xs uppercase inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-semibold mb-3">Platform features</div>
            <h2 className="text-3xl font-bold">Complete Development Ecosystem</h2>
            <p className="text-slate-600 mt-2">AI Professor, Obsidian knowledge base, Git server, Spark CLI — everything you need from learning to deployment.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f) => (
              <FeatureCard key={f.title} title={f.title} text={f.text} tag={f.tag} />
            ))}
          </div>
        </section>

        {/* Deploy section (example with code block) */}
        <section className="mt-12 grid lg:grid-cols-2 gap-8 items-center">
          <div className="bg-white rounded-xl p-6 border shadow-sm">
            <h3 className="text-2xl font-semibold mb-3">Deploy At Scale With Spark</h3>
            <p className="text-slate-600 mb-4">Rust‑powered CLI for mass device deployment. Perfect for IoT, Raspberry Pi farms, and edge computing.</p>
            <ul className="list-disc list-inside text-slate-600">
              <li>One-command deployment</li>
              <li>Real-time device monitoring</li>
              <li>Session tracking & analytics</li>
            </ul>
          </div>

          <div className="bg-slate-900 text-slate-50 rounded-xl p-6 shadow-lg border border-slate-800">
            <pre className="text-sm leading-6">
{`$ spark unique share ai-assistant-v2
- Generated code: 755482
- Listening for connections...
✓ Device #1 connected
✓ Device #2 connected
✓ Device #3 connected`}
            </pre>
          </div>
        </section>

        {/* Cards / Pricing */}
        <section className="mt-12">
          <h3 className="text-3xl font-bold text-center mb-6">Everyone Deserves Excellence</h3>
          <p className="text-center text-slate-600 max-w-2xl mx-auto mb-6">Affordable access to world-class AI mentorship. Lock in pre-sale pricing now.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricing.map((p) => (
              <div key={p.title} className={`rounded-xl p-6 border shadow-sm ${p.featured ? 'bg-emerald-600 text-white scale-100 transform' : 'bg-white'}`}>
                <div className="text-sm font-semibold mb-2">{p.title}</div>
                <div className="text-2xl font-bold mb-2">{p.price}</div>
                <div className="text-sm text-slate-600 mb-4">{p.note}</div>
                <button className={`w-full py-2 rounded-md ${p.featured ? 'bg-white text-emerald-600 font-bold' : 'bg-emerald-500 text-white'}`}>
                  {p.featured ? 'Pre-Order Now' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-12 pb-12">
          <div className="text-center mb-6">
            <h3 className="text-3xl font-bold">Frequently Asked Questions</h3>
            <p className="text-slate-600 mt-2">Everything you need to know about Netbit platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((f) => (
              <div key={f.q} className="bg-white rounded-xl p-6 border shadow-sm">
                <div className="font-semibold mb-2">{f.q}</div>
                <div className="text-slate-600 text-sm">{f.a}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-white border-t">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">N</div><div className="font-semibold">Netbit</div></div>
            <div className="text-slate-500 mt-3 text-sm">Everyone deserves a great professor</div>
          </div>
          <div>
            <div className="font-semibold mb-2">Platform</div>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>AI Professor</li>
              <li>Obsidian Base</li>
              <li>Git Server</li>
              <li>Spark CLI</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Company</div>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>About</li>
              <li>Enterprise</li>
              <li>Roadmap</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Contact</div>
            <div className="text-sm text-slate-600">general@veloro.su</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
