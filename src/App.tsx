
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './WalletContext';
import Header from './components/Header';
import HomePage from './components/HomePage';
import MarketplacePage from './components/MarketplacePage';
import ItemDetailPage from './components/ItemDetailPage';
import CreateNFTPage from './components/CreateNFTPage';
import MyListedItemsPage from './components/MyListedItemsPage';
import ProfilePage from './components/ProfilePage';
import Profile from './components/Profile';

import MarketplaceAbi from './contractsData/Marketplace.json';
import MarketplaceAddress from './contractsData/Marketplace-address.json';
import NFTAbi from './contractsData/NFT.json';
import NFTAddress from './contractsData/NFT-address.json';
import Loading from './components/loading/Loading';
import {Footer} from './components/Footer';
import { Contract, Signer } from 'ethers';

// const VITE_API_URL="https://okilm-83-234-227-67.a.free.pinggy.link";

interface ProfileForm {
  username: string;
  bio: string;
  avatar: string;
}


function App() {
  //real rolex-marker code
  console.log("API_Key>>>", VITE_API_URL);
    const [loading, setLoading] = useState<boolean>(true);
    const [account, setAccount] = useState<string|null>(null);  
    const [marketplace, setMarketplace] = useState<Contract|null>(null);
    const [nft, setNFT] = useState<Contract|null>(null);
    const [form, setForm] = useState<ProfileForm>({
      username: "",
      bio: "",
      avatar: "",
    });

    const firstLoadingData = async () => {  
      if (!window.ethereum) {
        alert('Install MetaMask');
        return;
      }
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
  
          console.log('Get singer sucssess singer Address:', address);
          loadContracts(signer); 
      } catch (error) {
       console.error('First Loading Data Error:', error);
      }

    }
  
    const loginWithMetaMask = async () => {
      if (!window.ethereum) {
        alert('Install MetaMask');
        return;
      }
  
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
  
        // 1️⃣ Request nonce from backend
        const { data } = await axios.get<{ nonce: string }>(`/auth/nonce/${address}`);
        const nonce = data.nonce;
  
        // 2️⃣ Ask user to sign the message
        const signature = await signer.signMessage(`Login nonce: ${nonce}`);
  
        // 3️⃣ Verify signature with backend
        const verify = await axios.post<{
          success: boolean;
          token: string;
        }>(`/auth/verify`, {
          address,
          signature,
        });
  
        if (verify.data.success) {
          localStorage.setItem("token", verify.data.token);
          setAccount(address);
          console.log('Login success:', address);
          loadContracts(signer); 
           axios.get(`$/profile`, {
        headers: { Authorization: `Bearer ${verify.data.token}` },
         }).then(res => {
         if (res.data) {
          setForm(res.data);
        }
      });
        } else {
          console.log('Login failed');
        }
      } catch (error) {
        console.error('MetaMask login error:', error);
      }
    };
  
  
    const loadContracts = async (signer : Signer) => {
      try {
        const marketplaceContract = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, signer);
        const nftContract = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer);
  
        setMarketplace(marketplaceContract);
        setNFT(nftContract);
        setLoading(false);
  
        console.log('Contracts loaded:', marketplaceContract, nftContract);
      } catch (error) {
        console.error('Error loading contracts:', error);
      }
    };
  
    const reloadUserinfor = (): void => {
       axios.get(`/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
         }).then(res => {
         if (res.data) {
          setForm(res.data);
          console.log(res.data)
        }
      });
    }
   
    const disConnectWallet = () => {
      setAccount(null);
      localStorage.removeItem('token');
    }
    
    useEffect(() => {
      firstLoadingData();
      if (window.ethereum) {
        window.ethereum.on('chainChanged', () => window.location.reload());
        window.ethereum.on('accountsChanged', () => window.location.reload());
      }
    }, []);
  

  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <Header loginWithMetaMask={loginWithMetaMask} disConnectWallet={disConnectWallet} account={account} form={form}/>
          <div>
            {loading ? (
                      <Loading content="Loading App... Please Wait" />
                    ) : (
          <Routes>
            <Route path="/" element={<HomePage marketplace={marketplace} nft={nft} account={account}/>} />
            <Route path="/marketplace" element={<MarketplacePage marketplace={marketplace} nft={nft} account={account}/>} />
            <Route path="/nft/:id/:time" element={<ItemDetailPage marketplace={marketplace} nft={nft} account={account}/>} />
            <Route path="/create" element={<CreateNFTPage marketplace={marketplace} nft={nft} account={account}/>} />
            <Route path="/my-items" element={<MyListedItemsPage marketplace={marketplace} nft={nft} account={account}/>} />
            <Route path="/profile" element={<ProfilePage marketplace={marketplace} nft={nft} account={account}/>} />
            <Route path="/profileedit" element={<Profile  formFir = {form} reloadUserinfor = {reloadUserinfor}/>} />
          </Routes>
          )}
        </div>
        <Footer />
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;
