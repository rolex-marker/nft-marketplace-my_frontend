import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet } from 'lucide-react';
import { useWallet } from '../../WalletContext';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  loginWithMetaMask: () => void;
}

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ loginWithMetaMask, isOpen, onClose }) => {
  const { connectWallet } = useWallet();

  const handleConnect = () => {
    loginWithMetaMask();
    // connectWallet();
    onClose();
  };

  const wallets = [
    {
      name: 'MetaMask',
      icon: '🦊',
      description: 'Connect using MetaMask wallet'
    },
    {
      name: 'WalletConnect',
      icon: '🔗',
      description: 'Scan with WalletConnect'
    },
    {
      name: 'Coinbase Wallet',
      icon: '💼',
      description: 'Connect with Coinbase'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Connect Wallet</h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <p className="text-gray-600 mt-2">
                  Choose your preferred wallet to connect to NFTMarket
                </p>
              </div>

              {/* Wallet Options */}
              <div className="p-6 space-y-3">
                {wallets.map((wallet) => (
                  <motion.button
                    key={wallet.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConnect}
                    className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-purple-600 hover:bg-purple-50 transition-all flex items-center space-x-4 group"
                  >
                    <div className="text-4xl">{wallet.icon}</div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600">
                        {wallet.name}
                      </h3>
                      <p className="text-sm text-gray-500">{wallet.description}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-purple-600 flex items-center justify-center transition-colors">
                      <svg
                        className="w-4 h-4 text-gray-400 group-hover:text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  By connecting a wallet, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WalletConnectModal;
