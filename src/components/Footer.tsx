import React from 'react';
import { Twitter, MessageCircle, Globe, Mail, Sparkles } from 'lucide-react';
// import { Button } from './ui/Button';

export function Footer() {
  return (
    <footer className="glass-strong border-t border-blue-500/20 mt-20">
      <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 gradient-blue rounded-xl flex items-center justify-center neon-glow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black neon-text">NFT Market</h3>
            </div>
            <p className="text-black-400 text-sm mb-4">
              The next generation NFT marketplace for creators and collectors.
            </p>
            <div className="flex gap-3">
              <a href="#" className="glass p-2 rounded-lg hover:bg-blue-500/20 transition-colors">
                <Twitter className="w-5 h-5 text-black-300" />
              </a>
              <a href="#" className="glass p-2 rounded-lg hover:bg-black-500/20 transition-colors">
                <MessageCircle className="w-5 h-5 text-black-300" />
              </a>
              <a href="#" className="glass p-2 rounded-lg hover:bg-black-500/20 transition-colors">
                <Globe className="w-5 h-5 text-black-300" />
              </a>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="text-black font-semibold mb-4">Marketplace</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-black-400 hover:text-black-300 transition-colors text-sm">All NFTs</a></li>
              <li><a href="#" className="text-black-400 hover:text-black-300 transition-colors text-sm">Art</a></li>
              <li><a href="#" className="text-black-400 hover:text-black-300 transition-colors text-sm">Photography</a></li>
              <li><a href="#" className="text-black-400 hover:text-black-300 transition-colors text-sm">Gaming</a></li>
              <li><a href="#" className="text-black-400 hover:text-black-300 transition-colors text-sm">Music</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-black font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-black-400 hover:text-blue-300 transition-colors text-sm">Help Center</a></li>
              <li><a href="#" className="text-black-400 hover:text-blue-300 transition-colors text-sm">Platform Status</a></li>
              <li><a href="#" className="text-black-400 hover:text-blue-300 transition-colors text-sm">Partners</a></li>
              <li><a href="#" className="text-black-400 hover:text-blue-300 transition-colors text-sm">Gas Tracker</a></li>
              <li><a href="#" className="text-black-400 hover:text-blue-300 transition-colors text-sm">Blog</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-black font-semibold mb-4">Stay Updated</h4>
            <p className="text-black-400 text-sm mb-4">
              Subscribe to get the latest updates and exclusive drops.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 glass px-4 py-2 rounded-lg text-white placeholder-black-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              {/* <Button variant="primary" size="sm" icon={<Mail className="w-4 h-4" />}>
                Subscribe
              </Button> */}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-blue-500/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-black-400 text-sm">
            © 2026 NFT Market. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-black-400 hover:text-blue-300 transition-colors">Privacy Policy</a>
            <a href="#" className="text-black-400 hover:text-blue-300 transition-colors">Terms of Service</a>
            <a href="#" className="text-black-400 hover:text-blue-300 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}