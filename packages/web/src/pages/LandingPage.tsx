import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiCode, FiUsers, FiStar, FiGitBranch, FiShield, FiZap, FiHeart } from 'react-icons/fi';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <Link to="/" className="flex items-center">
              <FiGithub className="h-8 w-8 text-white mr-3" />
              <span className="text-2xl font-bold text-white">NetBit</span>
            </Link>
          </div>
          <div className="flex lg:flex-1 lg:justify-end">
            <Link
              to="/login"
              className="text-sm font-semibold leading-6 text-white hover:text-blue-200 transition-colors"
            >
              Sign in <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
            <div className="mt-24 sm:mt-32 lg:mt-16">
              <span className="rounded-full bg-blue-600/10 px-3 py-1 text-sm leading-6 text-blue-300 ring-1 ring-inset ring-blue-600/10">
                Built for developers, by developers
              </span>
            </div>
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Where the world builds software
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Millions of developers and companies build, ship, and maintain their software on NetBit—the largest and most advanced development platform in the world.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <button
                onClick={onGetStarted}
                className="rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
              >
                Get started for free
              </button>
              <Link
                to="/login"
                className="text-lg font-semibold leading-6 text-white hover:text-blue-200 transition-colors"
              >
                Sign in <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <img
                className="w-[76rem] rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10"
                src="data:image/svg+xml,%3csvg width='800' height='500' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='%23f8fafc'/%3e%3ctext x='50%25' y='50%25' font-size='24' text-anchor='middle' dy='.3em' fill='%236b7280'%3eProject Dashboard Preview%3c/text%3e%3c/svg%3e"
                alt="NetBit Dashboard"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Everything you need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              The complete developer platform
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              NetBit provides everything your team needs to build and maintain software, from planning to deployment.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <FiCode className="h-5 w-5 flex-none text-blue-600" />
                  Collaborative coding
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Write, review, and ship code together with pull requests, merge queues, and code review assignments.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <FiShield className="h-5 w-5 flex-none text-blue-600" />
                  Security & compliance
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Keep your code secure with vulnerability scanning, secret scanning, and dependency management.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <FiZap className="h-5 w-5 flex-none text-blue-600" />
                  CI/CD & automation
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Automate your workflow from code to deployment with integrated CI/CD, testing, and monitoring.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Trusted by millions of developers
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-300">
                Join the world's largest community of developers and companies.
              </p>
            </div>
            <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col bg-white/5 p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-300">Developers</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-white">100M+</dd>
              </div>
              <div className="flex flex-col bg-white/5 p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-300">Organizations</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-white">4M+</dd>
              </div>
              <div className="flex flex-col bg-white/5 p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-300">Repositories</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-white">420M+</dd>
              </div>
              <div className="flex flex-col bg-white/5 p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-300">Fortune 100 companies</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-white">90%</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Join millions of developers and start building amazing projects today.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button
                onClick={onGetStarted}
                className="rounded-md bg-white px-6 py-3 text-lg font-semibold text-blue-600 shadow-sm hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all"
              >
                Get started for free
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex items-center justify-center">
            <p className="text-sm leading-5 text-gray-400 flex items-center">
              Made with <FiHeart className="h-4 w-4 text-red-500 mx-1" /> by the NetBit team
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;