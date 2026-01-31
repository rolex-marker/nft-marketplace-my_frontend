import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from "axios";
import { ethers, BigNumber } from 'ethers';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Gavel, 
  Tag, 
  Clock, 
  Eye, 
  Heart, 
  Share2,
  CheckCircle,
  Loader2,
  ArrowLeft,
  ImageIcon,
  ExternalLink
} from 'lucide-react';
import { mockNFTs, mockOffers, mockTransactions, shortenAddress } from '../mockData';
import { useWallet } from '../WalletContext';
import PlaceBidModal from './modals/PlaceBidModal';
import MakeOfferModal from './modals/MakeOfferModal';
import Toast, { ToastType } from './Toast';
import useCountdown from "./api/useCountdown";
import Loading from './loading/Loading';
import { useNavigate } from 'react-router-dom';

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

// types.ts (or top of file)

export interface BlockchainItem {
  itemId: number;
  seller: string;
  tokenId: string;
  totalPrice: ethers.BigNumber;
  name: string;
  description: string;
  image: string;
  sold: boolean;
  category: string;

  nft: any;
  endTime: number;
  highestBid: any;
  highestBidder: string;
  isAuction: boolean;
}

interface ItemDetailPageProps {
  marketplace: any; 
  nft: any;     
  account: string | null;
}

interface Offer {
  buyer: string;
  amount: string; // wei as string
  accepted: boolean;
}





const ItemDetailPage: React.FC<ItemDetailPageProps> = ({ marketplace, nft, account }) => {

  const { id, time } = useParams<{ id: string, time: string }>();
  console.log("id, time", id , time );
  const [showBidModal, setShowBidModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false
  });

  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState<boolean>(true);
  const [item, setItem] = useState<BlockchainItem | null>(null);
  const [seller, setSeller] = useState<string>('');
  
  const [isofferLoading, setIsofferLoading] = useState<boolean>(false);
  
  const [endTime, setEndTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isHighestBidder, setIsHighestBidder] = useState<boolean>(false);
  const [highestBidFormatted, setHighestBidFormatted] = useState<string>('0');
  const [priceFormatted, setPriceFormatted] = useState<string>('0');
  const [buttonLoading, setButtonLoading] = useState(false);
  const [ofrBtnLoading, setOfrBtnLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const [offers, setOffers] = useState<Offer[]>([]);
    // Load offers for this item
    const loadOffers = async () => {
      setIsofferLoading(true);
      if (!marketplace || !id) {
        setIsofferLoading(false);
        return;
      }
      try {
        const data = await marketplace.getOffers(id);
        // Convert BigNumber to number
        const parsedOffers = data.map((o: Offer) => ({
            buyer: o.buyer,
            amount: o.amount.toString(),
            accepted: o.accepted,
          }));
        console.log("parsedOffers>>>", parsedOffers)
        setOffers(parsedOffers);
        setIsofferLoading(false);
      } catch (err) {
        console.error("Failed to load offers:", err);
      } finally {    
      }
    };
  
    
  
    // Accept offer
    const acceptOffer = async (index: number) => {
      if (!marketplace) return;
      setButtonLoading(true);
      try {
        const tx = await marketplace.acceptOffer(item?.itemId, index);
        const receipt = await tx.wait();
        alert("Offer accepted successfully 🎉");
  
        const acceptedOffer = offers[index];
        await axios.post(
            `/transactions`,
            {
              itemId: item?.itemId,
              tokenId: item?.tokenId,
              price: ethers.utils.formatEther(acceptedOffer.amount),
              seller: account,
              buyer: acceptedOffer.buyer,
              type: "OFFER",
              txHash: receipt.transactionHash
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("Offer transaction recorded in backend ✅");
        // reloadItems(); // Refresh items
        loadOffers();
        setButtonLoading(false);
        setToast({ message: 'Offer accept successful!', type: 'success', visible: true });
        navigate("/marketplace");
      } catch (err) {
        console.error(err);
        alert("Failed to accept offer: " + (err));
      } finally {
      }
    };
  

  

  

  const phurchase = async () => {
  if (buttonLoading) return;

  setButtonLoading(true);
  try {
    const totalPrice = await marketplace.getTotalPrice(item?.itemId);

    // 1️⃣ Execute purchase
    const tx = await marketplace.purchaseItem(item?.itemId, {
      value: totalPrice,
    });

    // 2️⃣ Wait for confirmation
    const receipt = await tx.wait();

    // 3️⃣ Send transaction to backend
    

    await axios.post(
      `/transactions/`,
      {
        itemId: item?.itemId,
        tokenId: item?.tokenId || null,
        price: ethers.utils.formatEther(totalPrice),
        seller: item?.seller,
        buyer: account,
        type: "BUY",
        txHash: receipt.transactionHash,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

     setToast({ 
      message: 'Purchase successful! NFT transferred to your wallet.', 
      type: 'success', 
      visible: true });
     

  } catch (err) {
    console.error(err);
    alert("Purchase failed: " + (err));
  } finally {
    setButtonLoading(false);
     navigate("/my-items");
  }
  };

  const makeOffer = async ( amountEth: number) => {
      if (!marketplace || !item) return;
      if(ofrBtnLoading) return;
     
      let amount = amountEth.toString();
      setOfrBtnLoading(true);
      try {
        await (await marketplace.makeOffer(item.itemId, {
          value: ethers.utils.parseEther(amount)
        })).wait();
  
        
        setToast({ 
          message: `Offer of ${amount} ETH submitted successfully!`, 
          type: 'success', 
          visible: true 
        });
        loadOffers();
      } catch(err) {
        console.error(err);
        alert("Offer failed: " + (err));
      } finally {
        setOfrBtnLoading(false);
      }
    };
  

  const loadItem = async () => {
  try {
    const itemId = Number(id);
    
    if (!itemId) return;

    // Add this helper function at the top of your file
      const getFastUri = (uri: string) => {
        // Replace slow ipfs.io with fast cloudflare-ipfs.com or your own Pinata gateway
        return uri.replace("https://ipfs.io/ipfs/", "https://cloudflare-ipfs.com/ipfs/")
                  .replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/");
      };

    const itemData = await marketplace.items(itemId);
    const uri = await nft.tokenURI(itemData.tokenId);
    const metadata = await fetch(getFastUri(uri)).then(res => res.json());
    const totalPrice = await marketplace.getTotalPrice(itemId);

    setItem({
      itemId,
      seller: itemData.seller,
      tokenId: itemData.tokenId.toString(),
      totalPrice,
      name: metadata.name,
      description: metadata.description,
      image: metadata.image,
      category: metadata.category,
      sold: itemData.sold,
      nft: itemData.nft,
      endTime: itemData.endTime.toNumber(),
      highestBid: itemData.highestBid,
      highestBidder: itemData.highestBidder,
      isAuction: itemData.isAuction
    });
    
    setSeller(itemData.seller);

     setEndTime(itemData.endTime.toNumber());

     console.log("itemData>>>",itemData);
     console.log("account>>>",account);


  //     let middletimeLeft = useCountdown(endTime);
  // setTimeLeft(middletimeLeft);
  // setAuctionEnded(timeLeft <= 0);

  setIsOwner(itemData.seller && account &&itemData.seller.toLowerCase() === account.toLowerCase());

 setIsHighestBidder(
    itemData.highestBidder &&
    itemData.highestBidder !== ethers.constants.AddressZero &&
    account &&
    itemData.highestBidder.toLowerCase() === account.toLowerCase());


  setHighestBidFormatted(itemData.highestBid
    ? ethers.utils.formatEther(itemData.highestBid)
    : 
  "0");
  setPriceFormatted(totalPrice ? ethers.utils.formatEther(totalPrice) : "0");

  console.log(endTime, timeLeft, isOwner, isHighestBidder, highestBidFormatted, priceFormatted);

    
  } catch (err) {
    console.error("Failed to load item:", err);
  } finally {
    setLoading(false); 
  }
};

useEffect(() => {
    loadItem();
  }, [highestBidFormatted]);

//acution section
const placeBid = async (mount: number) => {
   if (!marketplace || !item) return;
    if (buttonLoading) return;

    let amount = mount.toString();
    
    setButtonLoading(true);
    try {
      const tx = await marketplace.placeBid(item.itemId, {
        value: ethers.utils.parseEther(amount),
      });
      await tx.wait();
      setHighestBidFormatted(amount.toString());
      setToast({ 
      message: `Bid of ${amount} ETH placed successfully!`, 
      type: 'success', 
      visible: true 
    });
    } catch (err) {
      console.error(err);
      alert("Bid failed: " + (err));
    } finally {
      setButtonLoading(false);
      
    }
  };

const finalizeAuction = async () => {
    if (buttonLoading) return;

    setButtonLoading(true);
    try {
      const tx = await marketplace.finalizeAuction(item?.itemId);
      const receipt = await tx.wait();

      alert("Auction finalized successfully 🎉");

      if (token) {
        await axios.post(
          `/transactions`,
          {
            itemId: item?.itemId,
            tokenId: item?.tokenId,
            price: highestBidFormatted,
            seller: item?.seller,
            buyer: item?.highestBidder,
            type: "AUCTION",
            txHash: receipt.transactionHash,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Auction transaction recorded ✅");
      }
      setToast({ 
      message: 'Auction Ended successfully!, NFT is transfered to Highest bidder', 
      type: 'success', 
      visible: true 
    });
    
    } catch (err) {
      console.error("Auction finalization failed:", err);
      alert("Auction finalization failed: " );
    } finally {
      setButtonLoading(false);
      
    }
  };

 
  const handleBuyNow = () => {
     
    if (!account) {
      setToast({ message: 'Please connect your wallet first', type: 'error', visible: true });
      return;
    }
    phurchase();
    
  };

  const handlePlaceBid = (amount: number) => {
    placeBid(amount);
  };

  const handleMakeOffer = (amount: number) => {
    makeOffer(amount);
  };

  

  useEffect(() => {
      loadOffers();
      
    }, [marketplace]);

  

  
  if (loading || !item || isofferLoading) return <Loading content="Loading Content... Plaese Wait" />;
  if (account === null) return (
      <Loading content="Connect your Wallet" />
    )
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            to="/marketplace" 
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Marketplace</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: NFT Image */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-3xl overflow-hidden bg-white border border-gray-200 shadow-xl"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full aspect-square object-cover"
              />
              
              {/* Quick Actions Overlay */}
              <div className="absolute top-6 right-6 flex space-x-3">
                <button className="p-3 rounded-xl bg-white/90 backdrop-blur-sm hover:bg-white transition-all shadow-lg">
                  <Heart className="w-5 h-5 text-gray-700" />
                </button>
                <button className="p-3 rounded-xl bg-white/90 backdrop-blur-sm hover:bg-white transition-all shadow-lg">
                  <Share2 className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center space-x-2 text-gray-600 mb-1">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">Views</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {/* {nft1.views} */}9213
                  </p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center space-x-2 text-gray-600 mb-1">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">Favorites</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {/* {nft1.favorites} */}902
                  </p>
              </div>
            </div>
          </div>

          {/* Right: nft1 Details */}
          <div className="space-y-6">
            {/* Title & Category */}
            <div>
              <div className="inline-flex px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
                {item.category}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{item.name}</h1>
              <p className="text-lg text-gray-600">{item.description}</p>
            </div>

            {/* Owner & Creator */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Owner</span>
                <span className="font-semibold text-gray-900">{item.seller.slice(2, 6)}...{item.seller.slice(-4)}</span>
              </div>
              {/* <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Creator</span>
                <span className="font-semibold text-gray-900">{shortenAddress(nft1.creator)}</span>
              </div> */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-sm text-gray-600">Token ID</span>
                <span className="font-mono text-sm text-gray-900">{item.tokenId}</span>
              </div>
            </div>

            {/* Auction Timer */}
            {item.isAuction === true && item.sold === false &&  (
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">Auction ends in</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {time && (
                    <>
                      <div className="bg-white/20 rounded-xl p-3 text-center backdrop-blur-sm">
                        <div className="text-3xl font-bold">
                         0
                          </div>
                        <div className="text-sm text-white/80">Days</div>
                      </div>
                      <div className="bg-white/20 rounded-xl p-3 text-center backdrop-blur-sm">
                        <div className="text-3xl font-bold">
                         {time.slice(0,2)}
                          </div>
                        <div className="text-sm text-white/80">Hours</div>
                      </div>
                      <div className="bg-white/20 rounded-xl p-3 text-center backdrop-blur-sm">
                        <div className="text-3xl font-bold">
                         {time.slice(3,5)}
                          </div>
                        <div className="text-sm text-white/80">Mins</div>
                      </div>
                      <div className="bg-white/20 rounded-xl p-3 text-center backdrop-blur-sm">
                        <div className="text-3xl font-bold">
                          {time.slice(6,8)}
                          </div>
                        <div className="text-sm text-white/80">Secs</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Price / Bid */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              {item.isAuction === true ?  (
                <>
                  <p className="text-sm text-gray-600 mb-2">Origin Bid</p>
                  <div className="flex items-baseline space-x-2 mb-4">
                    <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {ethers.utils.formatEther(item.totalPrice)}
                    </span>
                    <span className="text-xl text-gray-600">ETH</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Highest Bid</p>
                  <div className="flex items-baseline space-x-2 mb-4">
                    <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {highestBidFormatted}
                    </span>
                    <span className="text-xl text-gray-600">ETH</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Highest Auction Bidder</p>
                  <div className="flex items-baseline space-x-2 mb-4">
                    <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                     {item.highestBidder.slice(2, 6)}...{item.highestBidder.slice(-4)}
                    </span>
                    <span className="text-xl text-gray-600">ETH</span>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-2">Price</p>
                  <div className="flex items-baseline space-x-2 mb-4">
                    <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {ethers.utils.formatEther(item.totalPrice)}
                    </span>
                    <span className="text-xl text-gray-600">ETH</span>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              {item.sold === false &&  account !== null &&(
                <div className="grid grid-cols-1 gap-3">
                  
                   {item.isAuction === false && item.seller !== account && (
                    <button
                      disabled={buttonLoading}
                      onClick={handleBuyNow}
                      className="flex items-center justify-center space-x-2 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-xl hover:shadow-purple-500/30 transition-all"
                    >
                      
                      {buttonLoading ? (
                                        <>
                                          <Loader2 className="w-5 h-5 animate-spin" />
                                          <span>Buying...</span>
                                        </>
                                      ) : (
                                        <>
                                          <ShoppingCart className="w-5 h-5" />
                                           <span>Buy Now</span>
                                        </>
                                      )}
                    </button>)}
                  
                  {item.isAuction === true && (
                    <div>
                    <div>
                     {time != "AUC END" && !isOwner && (
                    <button
                      disabled={buttonLoading}
                      onClick={() => setShowBidModal(true)}
                      className="flex items-center justify-center space-x-2 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-xl hover:shadow-purple-500/30 transition-all"
                    >
                     
                      {buttonLoading ? (
                                        <>
                                          <Loader2 className="w-5 h-5 animate-spin" />
                                          <span>Place Bidding</span>
                                        </>
                                      ) : (
                                        <>
                                          <Gavel className="w-5 h-5" />
                                          <span>Place Bid</span>
                                        </>
                                      )}
                    </button>
                    )}
                    </div>
                    <div>
                     {time === "AUC END" && (
                    <button
                      disabled={buttonLoading}
                      onClick={() => finalizeAuction()}
                      className="flex items-center justify-center space-x-2 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-xl hover:shadow-purple-500/30 transition-all"
                    >
                      
                      {buttonLoading ? (
                                        <>
                                          <Loader2 className="w-5 h-5 animate-spin" />
                                          <span>Finalizing Auction...</span>
                                        </>
                                      ) : (
                                        <>
                                          <Gavel className="w-5 h-5" />
                                         <span>Finalize Auction</span>
                                        </>
                                      )}
                    </button>
                    )}
                    </div>
                    </div>
                  )}
                  {item.isAuction === false && item.seller !== account &&(<button
                    onClick={() => setShowOfferModal(true)}
                    disabled={ofrBtnLoading}
                    className="flex items-center justify-center space-x-2 px-6 py-4 rounded-xl border-2 border-gray-900 text-gray-900 font-semibold hover:bg-gray-900 hover:text-white transition-all"
                  >
                   
                    {ofrBtnLoading ? (
                                      <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Make Offering...</span>
                                      </>
                                    ) : (
                                      <>
                                       <Tag className="w-5 h-5" />
                                       <span>Make Offer</span>
                                      </>
                                    )}
                  </button>)}
                </div>
              )}
              
              { isOwner  && item.isAuction === true && (
                <div className="flex items-center justify-center space-x-2 px-6 py-4 rounded-xl bg-gray-100 text-green-600 font-semibold">
                  <span>You are this Auction Producer</span>
                </div>
              )}
              {item.sold == true && (
                <div className="flex items-center justify-center space-x-2 px-6 py-4 rounded-xl bg-gray-100 text-gray-600 font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  <span>Sold</span>
                </div>
              )}
            </div>

            {/* Offers Section */}
            {offers.length > 0 &&  (
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Tag className="w-5 h-5" />
                  <span>Offers ({offers.length})</span>
                </h3>
                <div className="space-y-3">
                  {offers.map((offer, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                         { ethers.utils.formatEther(offer.amount)} ETH
                          {/* {offer.amount.slice(0,5)}  */}
                        </p>
                        <p className="text-sm text-gray-600">
                          from {shortenAddress(offer.buyer)}
                        </p>
                      </div>
                      { !offer.accepted  && item.seller === account && item.sold === false &&(
                        <button
                          disabled={buttonLoading}
                          onClick={() => acceptOffer(idx)}
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium hover:shadow-lg transition-all"
                        >   
                    <span>accept</span>
                        </button>
                      )}
                      {offer.accepted == true && (
                        <div>
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm text-gray-500 capitalize">Accepted</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

           
          </div>
        </div>
      </div>

      <PlaceBidModal
        isOpen={showBidModal}
        onClose={() => setShowBidModal(false)}
        currentBid={highestBidFormatted}
        nftName={item.name}
        handlePlaceBid={handlePlaceBid}
      />

      <MakeOfferModal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        nftName={item.name}
        currentPrice={ethers.utils.formatEther(item.totalPrice)}
        onMakeOffer={handleMakeOffer}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </div>

  );
};

export default ItemDetailPage;


