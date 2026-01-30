export interface NFT {
  id: string;
  tokenId: string;
  name: string;
  description: string;
  image: string;
  owner: string;
  creator: string;
  price?: number;
  highestBid?: number;
  saleType: 'fixed' | 'auction' | 'sold';
  auctionEndTime?: Date;
  status: 'active' | 'sold' | 'ended';
  category: string;
  views: number;
  favorites: number;
}

export interface Offer {
  id: string;
  nftId: string;
  buyer: string;
  amount: number;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Transaction {
  id: string;
  type: 'minted' | 'listed' | 'bid' | 'sold' | 'offer';
  from: string;
  to?: string;
  amount?: number;
  timestamp: Date;
  txHash: string;
}

export interface User {
  address: string;
  avatar?: string;
  bio?: string;
  nftsCreated: number;
  nftsSold: number;
  totalEarned: number;
}

export const mockNFTs: NFT[] = [
  {
    id: '1',
    tokenId: '1001',
    name: 'Cosmic Dreams #1',
    description: 'A mesmerizing journey through the digital cosmos, featuring vibrant colors and abstract patterns.',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&q=80',
    owner: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    creator: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    price: 2.5,
    saleType: 'fixed',
    status: 'active',
    category: 'Art',
    views: 1234,
    favorites: 89
  },
  {
    id: '2',
    tokenId: '1002',
    name: 'Neon Cityscape',
    description: 'Futuristic city lights captured in a stunning digital masterpiece.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    owner: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    creator: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    highestBid: 3.2,
    saleType: 'auction',
    auctionEndTime: new Date(Date.now() + 86400000 * 2),
    status: 'active',
    category: 'Photography',
    views: 2341,
    favorites: 156
  },
  {
    id: '3',
    tokenId: '1003',
    name: 'Abstract Reality',
    description: 'Where reality meets imagination in perfect harmony.',
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80',
    owner: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c',
    creator: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c',
    price: 1.8,
    saleType: 'fixed',
    status: 'active',
    category: 'Art',
    views: 987,
    favorites: 67
  },
  {
    id: '4',
    tokenId: '1004',
    name: 'Digital Waves',
    description: 'Flowing patterns that evoke the rhythm of the ocean.',
    image: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=800&q=80',
    owner: '0x9F7A046A59F4B5E5E1F1E2d3C4B5A6D7E8F9A0B1',
    creator: '0x9F7A046A59F4B5E5E1F1E2d3C4B5A6D7E8F9A0B1',
    highestBid: 5.7,
    saleType: 'auction',
    auctionEndTime: new Date(Date.now() + 86400000 * 1),
    status: 'active',
    category: 'Art',
    views: 3456,
    favorites: 234
  },
  {
    id: '5',
    tokenId: '1005',
    name: 'Ethereal Glow',
    description: 'A soft, glowing composition that brings peace to the digital realm.',
    image: 'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=800&q=80',
    owner: '0x1234567890123456789012345678901234567890',
    creator: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    price: 0.8,
    saleType: 'sold',
    status: 'sold',
    category: 'Art',
    views: 876,
    favorites: 45
  },
  {
    id: '6',
    tokenId: '1006',
    name: 'Quantum Burst',
    description: 'Energy exploding across the digital canvas.',
    image: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&q=80',
    owner: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    creator: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    highestBid: 2.1,
    saleType: 'auction',
    auctionEndTime: new Date(Date.now() + 86400000 * 3),
    status: 'active',
    category: 'Art',
    views: 1567,
    favorites: 98
  },
  {
    id: '7',
    tokenId: '1007',
    name: 'Prism Portal',
    description: 'Step through the gateway to another dimension.',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
    owner: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    creator: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    price: 4.2,
    saleType: 'fixed',
    status: 'active',
    category: 'Art',
    views: 2109,
    favorites: 145
  },
  {
    id: '8',
    tokenId: '1008',
    name: 'Nebula Fragment',
    description: 'A piece of the cosmos preserved forever on the blockchain.',
    image: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=800&q=80',
    owner: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c',
    creator: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c',
    price: 3.5,
    saleType: 'fixed',
    status: 'active',
    category: 'Art',
    views: 1823,
    favorites: 112
  }
];

export const mockOffers: Offer[] = [
  {
    id: 'offer-1',
    nftId: '1',
    buyer: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    amount: 2.2,
    timestamp: new Date(Date.now() - 3600000),
    status: 'pending'
  },
  {
    id: 'offer-2',
    nftId: '1',
    buyer: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c',
    amount: 2.4,
    timestamp: new Date(Date.now() - 7200000),
    status: 'pending'
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    type: 'minted',
    from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    timestamp: new Date(Date.now() - 86400000 * 7),
    txHash: '0x1234567890abcdef'
  },
  {
    id: 'tx-2',
    type: 'listed',
    from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    amount: 2.5,
    timestamp: new Date(Date.now() - 86400000 * 6),
    txHash: '0x2345678901bcdef0'
  },
  {
    id: 'tx-3',
    type: 'offer',
    from: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    amount: 2.2,
    timestamp: new Date(Date.now() - 3600000),
    txHash: '0x3456789012cdef01'
  }
];

export const topSellers = [
  {
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
    totalSold: 45.6
  },
  {
    address: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&q=80',
    totalSold: 38.2
  },
  {
    address: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    totalSold: 32.8
  },
  {
    address: '0x9F7A046A59F4B5E5E1F1E2d3C4B5A6D7E8F9A0B1',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&q=80',
    totalSold: 28.4
  }
];

export const mockUser: User = {
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
  bio: 'Digital artist exploring the intersection of technology and creativity.',
  nftsCreated: 24,
  nftsSold: 18,
  totalEarned: 45.6
};

export const shortenAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
