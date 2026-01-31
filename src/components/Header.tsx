import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../WalletContext';
import { shortenAddress } from '../mockData';
import WalletConnectModal from './modals/WalletConnectModal';

import '../styles/globalAdd.css'

interface ProfileForm {
  username: string;
  bio: string;
  avatar: string;
}

interface HeaderProps {
  loginWithMetaMask: () => Promise<void>;
  disConnectWallet: () => void;
  account: string | null;
  form: ProfileForm;
}

const Header: React.FC<HeaderProps> = ({ loginWithMetaMask, disConnectWallet, account, form }) => {
  const location = useLocation();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = account
  ? [
      { name: 'Home', path: '/' },
      { name: 'Explore', path: '/marketplace' },
      { name: 'Create', path: '/create' },
      { name: 'My Items', path: '/my-items' },
      { name: 'Profile', path: '/profile' }
    ]
  : [
      { name: 'Home', path: '/' },
      { name: 'Explore', path: '/marketplace' }
    ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                NFTMarket
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    location.pathname === item.path
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Wallet Connect Button */}
            <div className="flex items-center space-x-4">
              {account ? (
                <div className='nav-connect_box'>
                <button
                  onClick={() => disConnectWallet()}
                  className="hidden md:flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                  <Wallet className="w-4 h-4" />
                  <span>{account.slice(0, 6)}...{account.slice(-4)}</span>
                </button>
                <Link to="/profileedit">
                  <div className="nav-avatar_information">
                  <img className='nav-avatar' src={form.avatar} alt="people"/>
                   <span className='nav-username'> {form.username}</span>
                   
                  </div>
                  </Link>
                  </div>
              ) : (
                <button
                  onClick={() => setShowWalletModal(true)}
                  // onClick={() => loginWithMetaMask()}
                  className="hidden md:flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 bg-white"
            >
              <div className="px-4 py-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    // onClick={() => setMobileMenuOpen(false)}
                     onClick={() => loginWithMetaMask()}
                    className={`block px-4 py-3 rounded-lg transition-all ${
                      location.pathname === item.path
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                {isConnected && address ? (
                  <button
                    onClick={() => {
                      disconnectWallet();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>{shortenAddress(address)}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowWalletModal(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Connect Wallet</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

<WalletConnectModal isOpen={showWalletModal} loginWithMetaMask={loginWithMetaMask} onClose={() => setShowWalletModal(false)} />
    </>
  );
};

export default Header;
