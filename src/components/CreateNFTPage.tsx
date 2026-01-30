import React, { useState } from 'react';
import { ethers } from "ethers"
import axios from 'axios' 
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';
import { useWallet } from '../WalletContext';
import Toast, { ToastType } from './Toast';
import Loading from './loading/Loading';
import { Contract } from 'ethers';


interface CreateNFTPageProps {
  marketplace: Contract|null;
  nft: Contract|null;
  account: string|null;
}

const PINATA_API_KEY = 'ad6c656a7f0cc603a4ef'
const PINATA_SECRET_API_KEY =
  'd6cd229b6cfa3e565146eeebc37bb3c14375176dd128e7f5c05ebdc830c637f8'

const CreateNFTPage: React.FC<CreateNFTPageProps> = ({ marketplace, nft, account }) => {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    saleType: 'fixed' as 'fixed' | 'auction',
    auctionDuration: '7'
  });
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false
  });

  const [image, setImage] = useState('');
  const [price, setPrice] = useState('');
  const [name, setName] = useState('');
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState('');
  const [goExploPa, setGoExploPa] = useState(false)
  

  // Upload image to Pinata
    const uploadToIPFS = async (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault()
      const file = event.target.files?.[0];
      setImagePreview(true);
      if (!file) return
  
      try {
        const formData = new FormData()
        formData.append('file', file)
  
        const res = await axios.post(
          'https://api.pinata.cloud/pinning/pinFileToIPFS',
          formData,
          {
             maxBodyLength: Infinity,
              timeout: 120000, // ⬅️ 2 minutes
            headers: {
              pinata_api_key: PINATA_API_KEY,
              pinata_secret_api_key: PINATA_SECRET_API_KEY
            }
          }
        )
  
        const url = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`
        console.log("IPFS URL:", url)
        setImage(url)
  
      } catch (error) {
        console.log("ipfs image upload error:", error)
      }
    }

    // Upload metadata to Pinata
      const createNFT = async () => {
        
        if (!marketplace || !nft) {
            setToast({
              message: 'Smart contracts not loaded',
              type: 'error',
              visible: true
            });
            return;
          }
    
        if (uploading) return

         try {
        if (!image || !price || !name || !description) return

        try {
          const metadata = {
            name,
            description,
            image,
            price
          }
    
          const res = await axios.post(
            'https://api.pinata.cloud/pinning/pinJSONToIPFS',
            metadata,
            {
              headers: {
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_SECRET_API_KEY
              }
            }
          )
    
          const uri = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`
        if(formData.saleType === 'auction')
        {await mintThenAuction(uri)}
        else {await mintThenList(uri) }
        setToast({ 
        message: 'NFT minted successfully! Redirecting to marketplace...', 
        type: 'success', 
        visible: true 
      });
        navigate("/marketplace");
        } catch (error) {
          console.log("ipfs metadata upload error:", error)
        }  } catch (err) {
        console.error(err)
      } finally {
        setUploading(false);
      }
      }
    
    // Mint NFT and list on marketplace
      const mintThenList = async (uri: string) => {
        const tx1 = await nft?.mint(uri);
        await tx1.wait();
        const id = await nft?.tokenCount()
        console.log("created NFTID:",id);
        await (await nft?.setApprovalForAll(marketplace?.address, true)).wait()
        const listingPrice = ethers.utils.parseEther(price.toString())
        await (await marketplace?.makeItem(nft?.address, id, listingPrice)).wait()
        
      }
    // Mint NFT and Auction on marketplace
      const mintThenAuction = async (uri: string) => {
        const tx1 = await nft?.mint(uri);
        await tx1.wait();
        const id = await nft?.tokenCount()
        console.log("created NFTID:",id);
        await (await nft?.setApprovalForAll(marketplace?.address, true)).wait()
        const weiPrice = ethers.utils.parseEther(price);
        await (await marketplace?.makeAuctionItem(nft?.address, id, weiPrice, Number(duration)*60 )).wait()
      }
    

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      setToast({ message: 'Please connect your wallet first', type: 'error', visible: true });
      return;
    }

    if (!imagePreview) {
      setToast({ message: 'Please upload an image', type: 'error', visible: true });
      return;
    }
    setUploading(true);
    createNFT();
    // Simulate minting process
  };

  if (account === null) return (
      <Loading content="Connect your Wallet" />
    )

  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create NFT</h1>
          <p className="text-gray-600">
            Upload your artwork and mint it as an NFT on the blockchain
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Upload Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Upload File *
            </label>
            <div
              className={`relative rounded-2xl border-2 border-dashed transition-all ${
                dragActive
                  ? 'border-purple-600 bg-purple-50'
                  : imagePreview
                  ? 'border-gray-300 bg-white'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
            >
              {imagePreview ? (
                <div className="relative aspect-square rounded-2xl overflow-hidden group">
                  <img
                    src={image}
                    alt="Uploading to IPFS..."
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="px-6 py-3 rounded-xl bg-white text-gray-900 font-semibold cursor-pointer hover:bg-gray-100 transition-colors">
                      Change Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={uploadToIPFS}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-square cursor-pointer p-12">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Upload className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    Drop your file here, or browse
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    PNG, JPG, GIF up to 100MB
                  </p>
                  <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium">
                    Choose File
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={uploadToIPFS}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Info Card */}
            <div className="mt-6 p-6 rounded-2xl bg-blue-50 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Tips for best results</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use high-quality images (recommended: 1000x1000px or higher)</li>
                <li>• Supported formats: PNG, JPG, GIF, WebP</li>
                <li>• Make sure your artwork is original</li>
              </ul>
            </div>
          </div>

          {/* Right: Form Section */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter NFT name"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-600 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your NFT"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-600 focus:outline-none resize-none"
                />
              </div>

              {/* Sale Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Sale Type *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, saleType: 'fixed' })}
                    className={`p-4 rounded-xl border-2 font-medium transition-all ${
                      formData.saleType === 'fixed'
                        ? 'border-purple-600 bg-purple-50 text-purple-900'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">💰</div>
                    Fixed Price
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, saleType: 'auction' })}
                    className={`p-4 rounded-xl border-2 font-medium transition-all ${
                      formData.saleType === 'auction'
                        ? 'border-purple-600 bg-purple-50 text-purple-900'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">🔨</div>
                    Auction
                  </button>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {formData.saleType === 'fixed' ? 'Price (ETH) *' : 'Starting Bid (ETH) *'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.0000001"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.0000000"
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-600 focus:outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    ETH
                  </span>
                </div>
              </div>

              {/* Auction Duration */}
              {formData.saleType === 'auction' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Auction Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-600 focus:outline-none"
                  >  
                    <option value="1">Set Auction Duaration</option>
                    <option value="10">10 minutes</option>
                    <option value="30">half hour</option>
                    <option value="60">1 hour</option>
                    <option value="180">3 hours</option>
                    <option value="1339">1 Day</option>
                  </select>
                </div>
              )}

              {/* Preview Card */}
              {imagePreview && name && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Preview</h4>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="aspect-square rounded-lg overflow-hidden mb-3">
                      <img src={image} alt="Preview Mint.." className="w-full h-full object-cover" />
                    </div>
                    <h5 className="font-semibold text-gray-900 mb-1">{name}</h5>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{description}</p>
                    {price && (
                      <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        {price} ETH
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploading}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-xl hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Minting NFT...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-5 h-5" />
                    <span>Mint NFT</span>
                  </>
                )}
              </button>

              {/* Gas Fee Notice */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> You will be prompted to confirm the transaction in your wallet. 
                  Gas fees will be calculated at the time of minting.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </div>
  );
};

export default CreateNFTPage;
