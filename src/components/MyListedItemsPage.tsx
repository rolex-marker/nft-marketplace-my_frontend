import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from "ethers";
import { motion } from 'framer-motion';
import { Package, CheckCircle, Clock, XCircle } from 'lucide-react';
import NFTCard from './NFTCard';
import Toast, { ToastType } from './Toast';
import Loading from './loading/Loading';
import '../styles/globalAdd.css'
import { useNavigate } from 'react-router-dom';
import { Contract, BigNumberish, BigNumber } from 'ethers';

interface MyListedItemsPageProps {
  marketplace: Contract|null;
  nft: Contract|null;
  account: string|null;
}

interface ListedNFT {
  totalPrice: BigNumberish;
  price?: BigNumber;
  itemId: number;
  tokenId: number;
  seller: string;
  name: string;
  description: string;
  image: string;
  sold: boolean;
  isAuction: boolean;
  offernum: number;
  endTime: BigNumber
}


const MyListedItemsPage: React.FC<MyListedItemsPageProps> = ({ marketplace, nft, account }) => {
  if(!marketplace || !nft ) return null;
  const navigate = useNavigate();
  // const { address } = useWallet();
  const [loading, setLoading] = useState(true);
  const [totalListedItems, setTotalListedItems] = useState<ListedNFT[]>([]);
  const [myNFTs, setMyNFTs] = useState<ListedNFT[]>([]);
  const [activeNFTs, setActiveNFTs] = useState<ListedNFT[]>([]);
  const [soldNFTs, setSoldNFTs] = useState<ListedNFT[]>([]);
  const [endedNFTs, setEndedNFTs] = useState<ListedNFT[]>([]);
  const [listed, setListed] = useState<ListedNFT[]>([]);
  const [myOwn, setMyOwn] = useState<ListedNFT[]>([]);
  const [funLoading, setFunLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'active' | 'sold'| 'myown' | 'ended'>('active');
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false
  });
  const isConnected = true; 
 

  // const loadListedItems = useCallback(async () => {
  //     if (!marketplace || !nft || !account) return null;
  
  //     setLoading(true); // start loading
  
  //     const itemCount = Number(await marketplace.itemCount());
  //     let listed = [];
  //     let myOwn = [];
  //     let items = [];
  //     const ownedTokenIds = new Set();
  
  //     for (let idx = 1; idx <= itemCount; idx++) {
  //       const i = await marketplace.items(idx);
  //       const uri = await nft.tokenURI(i.tokenId);
  //       const owner = await nft.ownerOf(i.tokenId);
  //       const metadata = await fetch(uri).then(res => res.json());
  //       const totalPrice = await marketplace.getTotalPrice(i.itemId);

  //       const data = await marketplace.getOffers(i.itemId); 
  //       const parsedOffer = data.length;
  
  //       const item = {
  //         totalPrice,
  //         price: i.price,
  //         itemId: i.itemId,
  //         tokenId: i.tokenId,
  //         seller: i.seller,
  //         name: metadata.name,
  //         description: metadata.description,
  //         image: metadata.image,
  //         sold: i.sold,
  //         isAuction: i.isAuction,
  //         offernum: parsedOffer,
  //         endTime: i.endTime
  //       };
  //       items.push(item);
  //       console.log('parsedOffer>>>', parsedOffer);
  //       // 🔵 My active listings
  //       if (i.seller.toLowerCase() === account.toLowerCase() && !i.sold) {
  //         listed.push(item);
  //       }
  
  //       // 🟢 NFTs I currently own
  //       if (owner.toLowerCase() === account.toLowerCase() && !ownedTokenIds.has(i.tokenId.toString())) {
  //         myOwn.push(item);
  //         ownedTokenIds.add(i.tokenId.toString());
  //       }
  //     }
  //     setMyOwn(myOwn);
  //     setListed(listed);
  //     setTotalListedItems(items);
  //       // derive from LOCAL items, not state
  //       const myItems = items.filter(
  //         (nft) => nft.seller.toLowerCase() === account.toLowerCase()
  //       )
  //       setMyNFTs(myItems)
  //       setActiveNFTs(
  //         myItems.filter((nft) => nft.sold === false && nft.isAuction === false)
  //       )
  //       setSoldNFTs(
  //         myItems.filter((nft) => nft.sold === true && nft.isAuction === false)
  //       )
  //       setEndedNFTs(
  //         myItems.filter((nft) => nft.isAuction === true)
  //       )
  //       console.log("totalListedItem>>>", items)
  //       setLoading(false)
  //   }, [marketplace, nft, account]);
  
    // ---------- call the loader on mount ----------

  // ... existing imports ...

  const loadListedItems = useCallback(async () => {
    if (!marketplace || !nft || !account) return;
    setLoading(true);

    try {
      const itemCount = (await marketplace.itemCount()).toNumber();
      const indices = Array.from({ length: itemCount }, (_, i) => i + 1);

      // 1. Fetch all raw items from contract in parallel
      const rawItems = await Promise.all(indices.map(i => marketplace.items(i)));

      const getFastUri = (uri: string) => {
          // Replace slow ipfs.io with fast cloudflare-ipfs.com or your own Pinata gateway
          return uri.replace("https://ipfs.io/ipfs/", "https://cloudflare-ipfs.com/ipfs/")
                    .replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/");
        };

      // 2. Fetch metadata, owner, price, and offers in parallel for every item
      const allItems = await Promise.all(
        rawItems.map(async (i) => {
          const uri = await nft.tokenURI(i.tokenId);
          const [owner, response, totalPrice, offersData] = await Promise.all([
            nft.ownerOf(i.tokenId),
            fetch(getFastUri(uri)),
            marketplace.getTotalPrice(i.itemId),
            marketplace.getOffers(i.itemId)
          ]);
          const metadata = await response.json();

          return {
            totalPrice,
            price: i.price,
            itemId: i.itemId,
            tokenId: i.tokenId,
            seller: i.seller,
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
            sold: i.sold,
            isAuction: i.isAuction,
            offernum: offersData.length,
            endTime: i.endTime,
            owner: owner.toLowerCase()
          };
        })
      );

      // 3. Filter data locally (very fast)
      const ownedTokenIds = new Set();
      const myOwnItems: ListedNFT[] = [];
      allItems.forEach(item => {
        if (item.owner === account.toLowerCase() && !ownedTokenIds.has(item.tokenId.toString())) {
          myOwnItems.push(item as any);
          ownedTokenIds.add(item.tokenId.toString());
        }
      });

      const myItems = allItems.filter(item => item.seller.toLowerCase() === account.toLowerCase());
      
      setMyOwn(myOwnItems);
      setListed(myItems.filter(i => !i.sold) as any);
      setTotalListedItems(allItems as any);
      setMyNFTs(myItems as any);
      setActiveNFTs(myItems.filter(i => !i.sold && !i.isAuction) as any);
      setSoldNFTs(myItems.filter(i => i.sold && !i.isAuction) as any);
      setEndedNFTs(myItems.filter(i => i.isAuction) as any);
    } catch (error) {
      console.error("Error loading listed items:", error);
    } finally {
      setLoading(false);
    }
  }, [marketplace, nft, account]);

// ... rest of existing code ...
    useEffect(() => {
      loadListedItems();
    }, [loadListedItems]); 

  const cancelListing = async (itemId: number) => {
    if (!marketplace) return;
    try {
      const tx = await marketplace.cancelItem(itemId);
      await tx.wait();
      setToast({ 
      message: 'Listing cancelled successfully!', 
      type: 'success', 
      visible: true 
    });
      loadListedItems(); // refresh after cancel
    } catch (err) {
      console.error(err);
      alert("Cancel failed: " + (err));
    }
  };

  const getCurrentNFTs = () => {
    switch (activeTab) {
      case 'active':
        return activeNFTs;
      case 'sold':
        return soldNFTs;
      case 'myown':
        return myOwn;
      case 'ended':
        return endedNFTs;
      default:
        return activeNFTs;
    }
  };

  const createAuction = async (aucTokenid: number) => {
      try {
        
         const acutionAmount = prompt("Enter Auction amount (ETH)");
         if (!acutionAmount) return;
         const acuDuration = prompt("Enter Auction Duration (minitues)");
         if (!acuDuration) return;
        setFunLoading(true)
        

        const weiPrice = ethers.utils.parseEther(acutionAmount)
        
  
        // ✅ STEP 1: Check approval
        const approvedAddress = await nft.getApproved(aucTokenid)
  
        if (approvedAddress.toLowerCase() !== marketplace.address.toLowerCase()) {
          console.log("Approving NFT...")
  
          const approveTx = await nft.approve(marketplace.address, aucTokenid)
          await approveTx.wait()
        }
  
        // ✅ STEP 2: Create auction
        const tx = await marketplace.makeAuctionItem(
          nft.address,
          aucTokenid,
          weiPrice,
          Number(acuDuration) * 60 // minutes → seconds
        )
  
        await tx.wait() 
        alert("Auction created 🎉")
        navigate("/marketplace");
      } catch (err) {
        console.error(err)
        alert("Transaction failed (see console)")
      } finally {
        setFunLoading(false)
      }
    }
  const relistNFT = async (aucTokenid: number) => {
      try {
        
         const relistAmount = prompt("Enter Relist amount (ETH)");
         if (!relistAmount) return;
        setFunLoading(true)
        

        const weiPrice = ethers.utils.parseEther(relistAmount)
        
  
        // ✅ STEP 1: Check approval
        const approvedAddress = await nft.getApproved(aucTokenid)
  
        if (approvedAddress.toLowerCase() !== marketplace.address.toLowerCase()) {
          console.log("Approving NFT...")
  
          const approveTx = await nft.approve(marketplace.address, aucTokenid)
          await approveTx.wait()
        }
  
        // ✅ STEP 2: Create auction
        const tx = await marketplace.makeItem(nft.address, aucTokenid, weiPrice)
  
        await tx.wait()
  
        alert("Relisting NFT created 🎉")
        navigate("/marketplace");
      } catch (err) {
        console.error(err)
        alert("Transaction failed (see console)")
      } finally {
        setFunLoading(false)
      }
    }

  const currentNFTs = getCurrentNFTs();

  const tabs = [
    { id: 'active' as const, label: 'Active', count: activeNFTs.length, icon: Clock },
    { id: 'sold' as const, label: 'Sold', count: soldNFTs.length, icon: CheckCircle },
    { id: 'myown' as const, label: 'Myown', count: myOwn.length, icon: CheckCircle },
    { id: 'ended' as const, label: 'Ended', count: endedNFTs.length, icon: XCircle }
  ];


  
  if (loading) return (<Loading content="Loading MyListpage... Please Wait" />);
  if (account === null) return (
      <Loading content="Connect your Wallet" />
    )
  

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-1">My Listed Items</h1>
              <p className="text-gray-600">Manage your NFT listings</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
              <p className="text-sm text-gray-600 mb-1">Total Listed</p>
              <p className="text-3xl font-bold text-gray-900">{myNFTs.length}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Active Listings</p>
              <p className="text-3xl font-bold text-gray-900">{activeNFTs.length}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Total Sold</p>
              <p className="text-3xl font-bold text-gray-900">{soldNFTs.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-sm font-bold ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* NFT Grid */}
        {currentNFTs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No {activeTab} items
            </h3>
            <p className="text-gray-600">
              {activeTab === 'active' 
                ? "You don't have any active listings yet"
                : activeTab === 'sold'
                ? "You haven't sold any NFTs yet"
                : "No ended auctions"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentNFTs.map((item, index) => (
              <motion.div
                key={item.itemId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                <NFTCard nft={item} account={account}/>
                
                {/* Action Buttons */}
                {activeTab === 'active' && (
                  <div className="mt-3 space-y-2">
                    <button
                      onClick={() => cancelListing(item.itemId)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition-all"
                    >
                      Cancel Listing
                    </button>
                  </div>
                )}
                {activeTab === 'myown' && (
                  <div className="mt-3 space-y-2">
                    <button
                      onClick={() => relistNFT(item.tokenId)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition-all"
                    >
                      Again Listing
                    </button>
                    <button
                      onClick={() => createAuction(item.tokenId)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:border-green-400 hover:bg-green-50 hover:text-green-700 transition-all"
                    >
                      Making Auction
                    </button>
                  </div>
                )}

                {/* Status Badge */}
                {/* {activeTab === 'sold' && (
                  <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-green-600 text-white text-sm font-semibold shadow-lg">
                    ✓ Sold
                  </div>
                )} */}
                {/* {activeTab === 'active' && (
                  <div className="absolute top-3 left-4 px-3 py-1.5 rounded-full bg-green-600 text-white text-sm font-semibold shadow-lg">
                    Offers
                    <span className='mylistitem-active_badgeoffer'>{item.offernum}</span>
                  </div>
                )} */}
              </motion.div>
            ))}
          </div>
        )}
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

export default MyListedItemsPage;
