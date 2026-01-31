import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ethers, BigNumber,BigNumberish } from "ethers";
import { Clock, Heart, Eye } from 'lucide-react';

import { getUser } from "./api/users";
import '../styles/globalAdd.css'
// import useCountdown from '../components/functions/useCountdown'

interface NFTItem {
  totalPrice: BigNumberish;
  itemId: number;
  seller: string;
  tokenId: number;
  name: string;
  description: string;
  image: string;
  category?: string;
  availitem?: string;
  isAuction: boolean;
  sold: boolean;
  endTime: BigNumber;
  offernum: number;
}

interface NFTCardProps {
  nft: NFTItem;
  account: string|null;
}

interface Creator {
  avatar?: string;
  username?: string;
}

const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  return [
    h.toString().padStart(2, "0"),
    m.toString().padStart(2, "0"),
    s.toString().padStart(2, "0"),
  ].join(":")
}


const NFTCard: React.FC<NFTCardProps> = ({ nft, account }) => {
  const [creator, setCreators] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("AUC END");


  const getTimeRemaining = (endTime?: BigNumber): string => {
  if (!endTime) return "AUC END"

  // BigNumber → number
  const end = endTime.toNumber()

  // endTime == 0 → auction ended
  if (end === 0) return "AUC END"

  const now = Math.floor(Date.now() / 1000) // seconds
  const diff = end - now;

  if (diff <= 0) return "AUC END"

  return formatTime(diff)
};

useEffect(() => {
  if (!nft.isAuction) return

  const interval = setInterval(() => {
    const time = getTimeRemaining(nft.endTime)
    setTimeRemaining(time)
  }, 1000)

  return () => clearInterval(interval)
}, [nft.endTime, nft.isAuction])

useEffect(() => {
  const loadCreators = async () => {
    setLoading(true);
    const profile = await getUser(nft.seller.toLowerCase());
    setCreators(profile);
    setLoading(false);
  };

  loadCreators();
}, [nft.seller]);


 if(loading) return (<main><h1>Loading NFTCard...</h1></main>)
  return (
    <Link to={`/nft/${nft.itemId}/${timeRemaining}`}>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-200 group"
      >
        {/* NFT Image */}
        <div className="relative overflow-hidden aspect-square px-3 py-2 bg-gray-100 hero-image-container">
          <img
            src={nft.image}
            loading='lazy'
            alt={nft.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 bids-card_img"
          />
          
          {/* Status Badge */}
          {nft.sold && (
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gray-700/90 backdrop-blur-sm text-red text-sm font-medium nftcard-solddisplay_button">
              Sold
            </div>
          )}
          {/* Status Badge */}
          {!nft.sold && (
            <div>
              { nft.seller === account ? <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gray-700/90 backdrop-blur-sm text-red text-sm font-medium nftcard-owerdisplay_button">
              Your owns
            </div> :  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gray-700/90 backdrop-blur-sm text-red text-sm font-medium nftcard-availdisplay_button">
              Available
            </div>}
            
           {nft.offernum >0 && (<div className="absolute top-3 left-4 px-3 py-1.5 rounded-full bg-green-600 text-white text-sm font-semibold shadow-lg">
                    Offers
                    <span className='mylistitem-active_badgeoffer'>{nft.offernum}</span>
                  </div>)
                  } 
            </div>
          )}
          
          {/* Auction Timer */}
          {nft.isAuction && (
            <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-purple-600/90 backdrop-blur-sm text-white text-sm font-small flex items-center space-x-1 nftcard-auctiondisplay_button">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeRemaining || "AUC Ended"}</span>

            </div>
          )}

          {/* Quick Stats Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between text-white text-sm">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span></span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-3">
          {/* NFT Name */}
          <h3 className="font-semibold text-lg text-gray-900 mb-2 truncate">
            {nft.name}
          </h3>

          {/* Owner */}
          {/* <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Owner</span>
            <span className="text-sm font-medium text-gray-900">
              {shortenAddress(nft.seller)}
            </span>
          </div> */}

          {/* Price / Bid Section */}
          <div className="pt-1 border-t border-gray-100">
            {nft.isAuction == true ? (
              <div>
                <p className="text-xs text-gray-500 mb-1">Current Bid</p>
                <div className="pb-2 flex items-baseline space-x-1">
                   <img
                          src="https://i.postimg.cc/T1F1K0bW/Ethereum.png"
                          alt="Ethereum"
                          className="small-image"
                        />
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                   {ethers.utils.formatEther(nft.totalPrice)}
                  </span>
                  <span className="text-sm text-gray-600">ETH</span>
                </div>
              </div>
            ) : nft.sold == true ? (
              <div>
                <p className="text-xs text-gray-500 mb-1">Sold For</p>
                <div className="flex items-baseline space-x-1">
                  <img
                          src="https://i.postimg.cc/T1F1K0bW/Ethereum.png"
                          alt="Ethereum"
                          className="small-image"
                        />
                  <span className="text-2xl font-bold text-gray-900">
                    {ethers.utils.formatEther(nft.totalPrice)}
                  </span>
                  <span className="text-sm text-gray-600">ETH</span>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-500 mb-1">Price</p>
                <div className="flex items-baseline space-x-1">
                   <img
                          src="https://i.postimg.cc/T1F1K0bW/Ethereum.png"
                          alt="Ethereum"
                          className="small-image"
                        />
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {ethers.utils.formatEther(nft.totalPrice)}
                  </span>
                  <span className="text-sm text-gray-600">ETH</span>
                </div>
              </div>
            )}
          </div>

          {/* 🔥 CREATOR SECTION */}
                  <div className="card-attribute">
                    <img
                      src={creator?.avatar}
                      alt="avatar"
                      className="small-avatar"
                    />
                    <p className="main-content_p">
                      Owner:
                      <span>
                        {creator?.username ||
                          nft.seller.slice(0, 6) + "..." +
                          nft.seller.slice(-4)}
                      </span>
                    </p>
                  </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default NFTCard;
