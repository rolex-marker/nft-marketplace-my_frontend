import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, SlidersHorizontal } from 'lucide-react';
import NFTCard from './NFTCard';
import Loading from './loading/Loading';
import { Contract, BigNumberish, BigNumber } from 'ethers';


interface HomePageProps {
  marketplace: Contract|null;
  nft: Contract|null;
  account: string|null;
}

interface MarketplaceItem {
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


const MarketplacePage: React.FC<HomePageProps> = ({ marketplace, nft, account }) => {
  if(!marketplace || !nft ) return null;
  type FilterBool = 'all' | boolean;
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [saleTypeFilter, setSaleTypeFilter] = useState<FilterBool>(false);
  const [statusFilter, setStatusFilter] = useState<FilterBool>(false);
  const [sortBy, setSortBy] = useState<'recent' | 'lowPrice'| 'expensivePrice' >('recent');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true)
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  

  // const loadMarketplaceItems = useCallback(async () => {
  //     // Load all unsold items
  //     const itemCount = (await marketplace.itemCount()).toNumber();
  //    const loadedItems: MarketplaceItem[] = [];
  //     for (let i = 1; i <= itemCount; i++) {
         
  //       const item = await marketplace.items(i)
        
  //         // get uri url from nft contract
  //         const uri = await nft.tokenURI(item.tokenId);
          
  //         // use uri to fetch the nft metadata stored on ipfs 
  //         const response = await fetch(uri)
  //         const metadata = await response.json()
  //         // get total price of item (item price + fee)
  //         const totalPrice = await marketplace.getTotalPrice(item.itemId)
  //         // Add item to items array
  //         loadedItems.push({
  //           totalPrice,
  //           itemId: item.itemId,
  //           seller: item.seller,
  //           tokenId: item.tokenId,
  //           name: metadata.name,
  //           description: metadata.description,
  //           image: metadata.image,
  //           category: metadata.category,
  //           availitem: metadata.availitem,
  //           isAuction: item.isAuction,
  //           sold: item.sold,
  //           endTime: item.endTime,
  //           offernum: item.offernum
  //         })
           
        
       
  //     }
  //     setLoading(false)
  //     setItems(loadedItems)
  //   }, [marketplace, nft]);

  const loadMarketplaceItems = useCallback(async () => {
    const itemCount = (await marketplace.itemCount()).toNumber();
    
    // 1. Create an array of indices [1, 2, 3...]
    const indices = Array.from({ length: itemCount }, (_, i) => i + 1);

    // 2. Fetch all raw items in parallel
    const rawItems = await Promise.all(
      indices.map(i => marketplace.items(i))
    );

    const getFastUri = (uri: string) => {
        // Replace slow ipfs.io with fast cloudflare-ipfs.com or your own Pinata gateway
        return uri.replace("https://ipfs.io/ipfs/", "https://cloudflare-ipfs.com/ipfs/")
                  .replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/");
      };
    // 3. Fetch all metadata (IPFS) and prices in parallel
    const loadedItems = await Promise.all(
      rawItems.map(async (item) => {
        const uri = await nft.tokenURI(item.tokenId);
        const [response, totalPrice] = await Promise.all([
          fetch(getFastUri(uri)),
          marketplace.getTotalPrice(item.itemId)
        ]);
        const metadata = await response.json();
        
        return {
          totalPrice,
          itemId: item.itemId,
          seller: item.seller,
          tokenId: item.tokenId,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
          category: metadata.category,
          isAuction: item.isAuction,
          sold: item.sold,
          endTime: item.endTime,
          offernum: item.offernum
        };
      })
    );

    setItems(loadedItems);
    setLoading(false);
}, [marketplace, nft]);

    useEffect(() => {
        loadMarketplaceItems()
      }, [loadMarketplaceItems])

      if (!marketplace || !nft) {
      return <Loading content="Loading contracts..." />;
      }
      
      if (loading) return (
        <Loading content="Loading Market... Please Wait"/>
      )

  const filteredNFTs = items
    .filter((nft) => {
      // Search filter
      if (searchTerm && !nft.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Sale type filter
      if (saleTypeFilter !== 'all' && nft.isAuction !== saleTypeFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && nft.sold !== statusFilter) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'lowPrice') {
        return BigNumber.from(a.totalPrice).gt(b.totalPrice) ? 1 : -1;
      }
      if (sortBy === 'expensivePrice') {
        return BigNumber.from(a.totalPrice).lt(b.totalPrice) ? 1 : -1;
      }
      return 0;
    });

    

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Explore Marketplace</h1>
              <p className="text-gray-600">
                Discover {filteredNFTs.length} unique digital assets
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search NFTs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-white border-2 border-gray-200 font-medium mb-4"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
            </button>

            <div className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-6`}>
              {/* Sale Type Filter */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center space-x-2 mb-4">
                  <Filter className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-900">Sale Type</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Items' },
                    { value: false, label: 'Common Trending' },
                    { value: true, label: 'Auction' }
                  ].map((option) => (
                    <button
                      // key={option.value}
                      onClick={() => setSaleTypeFilter(option.value as any)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition-all ${
                        saleTypeFilter === option.value
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Status</h3>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All' },
                     { value: false, label: 'Available' },
                     { value: true, label: 'Sold' },
                  ].map((option) => (
                    <button
                      // key={option.value}
                      onClick={() => setStatusFilter(option.value as any)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition-all ${
                        statusFilter === option.value
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Sort By</h3>
                <div className="space-y-2">
                  {[
                    { value: 'recent', label: 'Recently Listed' },
                    { value: 'lowPrice', label: 'Lowest Price' },
                    { value: 'expensivePrice', label: 'Highest Price' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value as any)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition-all ${
                        sortBy === option.value
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* NFT Grid */}
          <div className="flex-1">
            {filteredNFTs.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No NFTs Found</h3>
                <p className="text-gray-600">Try adjusting your filters or search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredNFTs.map((nft, index) => (
                  <motion.div
                    key={nft.itemId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NFTCard nft={nft} account={account} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
