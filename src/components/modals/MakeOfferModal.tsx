import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Loader2 } from 'lucide-react';

interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  nftName: string;
  currentPrice?: string;
  onMakeOffer: (amount: number) => void;
}

const MakeOfferModal: React.FC<MakeOfferModalProps> = ({
  isOpen,
  onClose,
  nftName,
  currentPrice,
  onMakeOffer
}) => {
  const [offerAmount, setOfferAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(offerAmount);
    
    if (amount <= 0) {
      alert('Offer must be greater than 0 ETH');
      return;
    }

    setIsProcessing(true);
    onMakeOffer(amount);
      setIsProcessing(false);
      setOfferAmount('');
      onClose();
    
    // Simulate blockchain transaction
   
  };

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
                      <Tag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Make an Offer</h2>
                      <p className="text-sm text-gray-600">{nftName}</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    disabled={isProcessing}
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Current Price Info */}
                {currentPrice && (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Price</span>
                      <span className="font-semibold text-gray-900">{currentPrice} ETH</span>
                    </div>
                  </div>
                )}

                {/* Offer Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Offer Amount (ETH)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.0000001"
                      min="0.0000001"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      placeholder="Enter your offer"
                      required
                      disabled={isProcessing}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-600 focus:outline-none text-lg font-semibold disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                      ETH
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> The seller will receive your offer and can choose to accept or reject it. You'll be notified of their decision.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isProcessing}
                    className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing || !offerAmount}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Make Offer</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MakeOfferModal;
