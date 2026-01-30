import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from "axios";
import { User, Sparkles, ShoppingBag, Tag, TrendingUp, Copy, ExternalLink, CheckCircle } from 'lucide-react';
import NFTCard from './NFTCard';
import { mockNFTs, mockUser, shortenAddress } from '../mockData';
import { useWallet } from '../WalletContext';
import Toast, { ToastType } from './Toast';
import '../styles/globalAdd.css'
import Loading from './loading/Loading';
import { Contract, BigNumberish, BigNumber } from 'ethers';

const API_URL = "https://fwpyh-83-234-227-67.a.free.pinggy.link";
interface ProfilePageProps {
  marketplace: Contract | null;
  nft: Contract | null;
  account: string | null;
}

interface ProfileForm {
  username: string;
  bio: string;
  avatar: string;
}

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

interface ProfileForm {
  username: string;
  bio: string;
  avatar: string;
  totalBought: number;
  totalSpent: number;
}

interface Transaction {
  _id: string;
  type: string;
  seller?: string;
  buyer?: string;
  price?: string;
  txHash: string;
}


const ProfilePage: React.FC<ProfilePageProps> = ({ marketplace, nft, account }) => {
  const [activeTab, setActiveTab] = useState<'created' | 'listed' | 'purchased' | 'offers'>('created');
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false
  });

   const [loading, setLoading] = useState<boolean>(true);
  const [totalListedItems, setTotalListedItems] = useState<NFTItem[]>([]);
  const [myNFTs, setMyNFTs] = useState<NFTItem[]>([]);
  const [createdNFTs, setCreatedNFTs] = useState<NFTItem[]>([]);
  const [listedNFTs, setListedNFTs] = useState<NFTItem[]>([]);
  const [purchasedNFTs, setPurchasedNFTs] = useState<NFTItem[]>([]);
  const [listed, setListed] = useState<NFTItem[]>([]);
  const [myOwn, setMyOwn] = useState<NFTItem[]>([]);
  const [form, setForm] = useState<ProfileForm>({
      username: '',
      bio: '',
      avatar: '',
      totalBought: 0,
      totalSpent: 0,
    });
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const token = localStorage.getItem("token");
  
  const loadListedItems = useCallback(async () => {
      if (!marketplace || !nft || !account) return;
  
      setLoading(true); // start loading
  
      const itemCount = (await marketplace.itemCount()).toNumber();
      let listed = [];
      let myOwn = [];
      let items = [];
      const ownedTokenIds = new Set();
  
      for (let idx = 1; idx <= itemCount; idx++) {
        const i = await marketplace.items(idx);
        const uri = await nft.tokenURI(i.tokenId);
        const owner = await nft.ownerOf(i.tokenId);
        const metadata = await fetch(uri).then(res => res.json());
        const totalPrice = await marketplace.getTotalPrice(i.itemId);
  
        const item = {
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
          endTime: i.endTime,
          offernum: i.offernum
        };
        items.push(item);
        // 🔵 My active listings
        if (i.seller.toLowerCase() === account.toLowerCase() && !i.sold) {
          listed.push(item);
        }
  
        // 🟢 NFTs I currently own
        if (owner.toLowerCase() === account.toLowerCase() && !ownedTokenIds.has(i.tokenId.toString())) {
          myOwn.push(item);
          ownedTokenIds.add(i.tokenId.toString());
        }
      }
      setMyOwn(myOwn);
      setListed(listed);
        setTotalListedItems(items);
        const myItems = items.filter(
          (nft) => nft.seller.toLowerCase() === account.toLowerCase()
        )
        setMyNFTs(myItems);
        setCreatedNFTs(myItems);
        setListedNFTs( myItems.filter((nft) => nft.sold === false ));
        setPurchasedNFTs(
            items.filter(
              nft => nft.sold && nft.seller.toLowerCase() !== account.toLowerCase()
            )
          );
        console.log("totalListedItem>>>", items)
        setLoading(false)
    }, [marketplace, nft, account]);
  
    useEffect(() => {
      loadListedItems();
    }, [loadListedItems]);

 

  

  
  const getCurrentNFTs = () => {
    switch (activeTab) {
      case 'created':
        return createdNFTs;
      case 'listed':
        return listedNFTs;
      case 'purchased':
        return myOwn;
      case 'offers':
        return [];
      default:
        return createdNFTs;
    }
  };

  const currentNFTs = getCurrentNFTs();

  const handleCopyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setToast({ message: 'Address copied to clipboard!', type: 'success', visible: true });
    }
  };

  const tabs = [
    { id: 'created' as const, label: 'Created', count: createdNFTs.length, icon: Sparkles },
    { id: 'listed' as const, label: 'Listed', count: listedNFTs.length, icon: ShoppingBag },
    { id: 'purchased' as const, label: 'Purchased', count: myOwn.length, icon: Tag },
    { id: 'offers' as const, label: 'Offers Made', count: 0, icon: TrendingUp }
  ];

  useEffect(() => {
      axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
         }).then(res => {
         if (res.data) {
          setForm(res.data);
          console.log("res.data>>>",res.data)
        }})
      axios.get(`${API_URL}/transactions/me`, {
        headers: { Authorization: `Bearer ${token}` },
         }).then(res => {
         if (res.data) {
          setTransactions(res.data);
          console.log("res.data>>>",res.data)
        }})
    }, [token]);

    if (loading) return (<Loading content="Loading ProfilePage... Please Wait" />);
    if (account === null) return (
      <Loading content="Connect your Wallet" />
    )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-800/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-3xl bg-white shadow-2xl overflow-hidden border-4 border-white/20">
                {form.avatar ? (
                  <img 
                    src={form.avatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-green-500 border-4 border-white flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  {shortenAddress(account!)}
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <button
                    onClick={handleCopyAddress}
                    className="p-2 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all"
                  >
                    <Copy className="w-4 h-4 text-white" />
                  </button>
                  <a
                    href={`https://etherscan.io/address/${account}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all"
                  >
                    <ExternalLink className="w-4 h-4 text-white" />
                  </a>
                </div>
              </div>
              {form.bio && (
                <p className="text-lg text-white/90 max-w-2xl mb-6">
                  {form.bio}
                </p>
              )}
              
              {/* Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6">
                <div className="text-center md:text-left">
                  <p className="text-2xl font-bold text-white">{form.username}</p>
                  <p className="text-sm text-white/80">Name</p>
                </div>
                <div className="w-px bg-white/20" />
                <div className="text-center md:text-left">
                  <p className="text-2xl font-bold text-white">{form.totalBought}</p>
                  <p className="text-sm text-white/80">Total Bought</p>
                </div>
                <div className="w-px bg-white/20" />
                <div className="text-center md:text-left">
                  <p className="text-2xl font-bold text-white">{form.totalSpent} ETH</p>
                  <p className="text-sm text-white/80">Total Spend</p>
                </div>
              </div>

               {/* Transaction History */}
            
           {transactions.length !== 0 && ( <div className='page-transaction_container'>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 ">
              <h3 className="font-semibold text-gray-900 mb-4">Transaction History</h3>
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div key={tx._id} className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 capitalize">{tx.type}</p>
                      <p className="text-sm text-gray-600">
                        {tx.seller && `From ${shortenAddress(tx.seller)}`}
                        {tx.buyer && ` to ${shortenAddress(tx.buyer)}`}
                      </p>
                      {tx.price && (
                        <p className="text-sm font-semibold text-purple-600">{tx.price} ETH</p>
                      )}
                    </div>
                    <a
                      href={`https://etherscan.io/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
            </div>
            )
            }
            
            

            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-2xl p-2 border border-gray-200 mb-8 inline-flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-50'
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

        {/* Content */}
        {activeTab === 'offers' ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Tag className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Offers Yet</h3>
            <p className="text-gray-600">You haven't made any offers on NFTs</p>
          </div>
        ) : currentNFTs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No NFTs in this category
            </h3>
            <p className="text-gray-600">
              {activeTab === 'created' && "You haven't created any NFTs yet"}
              {activeTab === 'listed' && "You don't have any active listings"}
              {activeTab === 'purchased' && "You haven't purchased any NFTs yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {currentNFTs.map((nft, index) => (
              <motion.div
                key={nft.itemId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <NFTCard nft={nft} account={account}/>
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

export default ProfilePage;
