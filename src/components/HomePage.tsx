import { useState, useEffect,useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import NFTCard from './NFTCard';
import Loading from './loading/Loading';
import { Contract, ethers, BigNumber,BigNumberish } from "ethers";

interface HomePageProps {
  marketplace: Contract|null;
  nft: Contract|null;
  account: string|null;
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

interface Seller {
 address: string;
 avatar: string;
 totalSpent: number;
}

const HomePage: React.FC<HomePageProps> = ({ marketplace, nft, account }) => {

    const API_URL = "https://bjrsd-83-234-227-67.a.free.pinggy.link";

    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState<NFTItem[]>([]);
    const [topSellers, setTopSellers] = useState<Seller[]>([]);

    const loadMarketplaceItems = useCallback(async () => {
      if (!marketplace || !nft) return;

      const itemCount = Number(await marketplace.itemCount());
      const loaded: NFTItem[] = [];

      for (let i = 1; i <= itemCount; i++) {
        const item = await marketplace.items(i);
        const uri = await nft.tokenURI(item.tokenId);
        const metadata = await (await fetch(uri)).json();
        const totalPrice = await marketplace.getTotalPrice(item.itemId);

        loaded.push({
          totalPrice,
          itemId: item.itemId,
          seller: item.seller,
          tokenId: item.tokenId,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
          category: metadata.category,
          availitem: metadata.availitem,
          isAuction: item.isAuction,
          sold: item.sold,
          endTime: item.endTime,
          offernum: item.offernum
        });
      }

      setItems(loaded);
      setLoading(false);
    }, [marketplace, nft]);

    const trendingitems = useMemo(() => items.slice(0, 4), [items]);
    const auctionitems = useMemo(
      () => items.filter(i => i.isAuction).slice(0, 4),
      [items]
    );

  
    useEffect(() => {
        const fetchTopSellers = async () => {
          try {
            const res = await axios.get<Seller[]>(`${API_URL}/profile/top-sellers`);
            setTopSellers(res.data);
            console.log("homeTopseller>>>", topSellers);
          } catch (err) {
            console.error("Failed to fetch top sellers:", err);
          }
        };
        fetchTopSellers();
      }, []);
  
    useEffect(() => {
      loadMarketplaceItems()
    }, [loadMarketplaceItems])

    if (loading) return (
      <Loading content="Loading Homepage... Pleasee Wait"/>
    )
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-blue-50 to-cyan-50 opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-purple-200 mb-6"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Premium NFT Marketplace</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-6"
            >
              Discover, Trade, and Auction
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Digital NFTs
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
            >
              The premier Web3 marketplace for buying, selling, and auctioning unique digital assets on the blockchain
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/marketplace"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-xl hover:shadow-purple-500/30 transition-all flex items-center space-x-2 group"
              >
                <span>Explore Marketplace</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/create"
                className="px-8 py-4 rounded-xl border-2 border-gray-900 text-gray-900 font-semibold hover:bg-gray-900 hover:text-white transition-all"
              >
                Create NFT
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live NFTs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Trending Now</h2>
            <p className="text-gray-600">Discover the hottest NFTs in the marketplace</p>
          </div>
          <Link
            to="/marketplace"
            className="hidden md:flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            <span>View All</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingitems.map((nft) => (
            <NFTCard key={nft.itemId} nft={nft} account={account ? account: "null"} />
          ))}
        </div>
      </section>

      {/* Top Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Top Sellers</h2>
            <p className="text-gray-600">Leading creators in our marketplace</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topSellers.map((seller, index) => (
            <motion.div
              key={seller.address}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl hover:border-purple-200 transition-all"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <img
                    src={seller.avatar}
                    alt="Seller"
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {seller.address.slice(0, 6)}...{seller.address.slice(-4)}
                  </p>
                  <p className="text-sm text-gray-500">Seller</p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Spent</span>
                  <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {seller.totalSpent} ETH
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trending Auctions Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">Trending Auctions</h2>
              <p className="text-gray-600">Active auctions ending soon</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {auctionitems.map((nft) => (
            <NFTCard key={nft.itemId} nft={nft} account={account} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-12">
          <div className="relative z-10 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Start Your NFT Journey?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of creators and collectors trading digital assets on the blockchain
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/create"
                className="px-8 py-4 rounded-xl bg-white text-purple-600 font-semibold hover:shadow-xl transition-all"
              >
                Create Your First NFT
              </Link>
              <Link
                to="/marketplace"
                className="px-8 py-4 rounded-xl border-2 border-white text-white font-semibold hover:bg-white/10 transition-all"
              >
                Browse Collection
              </Link>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-800/20 rounded-full blur-3xl" />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
