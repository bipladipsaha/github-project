"use client";

import { X, Star, Heart } from "lucide-react";
import { useEffect, useState } from "react";

export default function StarRepoModal({ isOpen, onClose, onContinue }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col transform transition-all">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-800">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Heart className="text-red-500 fill-red-500" size={20} />
            Support ProfileForge
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="text-yellow-500 fill-yellow-500" size={32} />
          </div>
          
          <h3 className="text-lg font-semibold mb-3 text-white">Please Star the Repository!</h3>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            ProfileForge is completely free and open-source. Before you continue, please consider supporting the project by starring the repository on GitHub!
          </p>

          <div className="flex flex-col gap-3">
            <a 
              href="https://github.com/bipladipsaha/github-project"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onContinue}
              className="w-full bg-white text-black px-5 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Star size={18} className="fill-black" />
              Star on GitHub
            </a>
            <button 
              onClick={onContinue}
              className="w-full bg-gray-800 text-gray-300 px-5 py-3 rounded-xl font-medium hover:bg-gray-700 hover:text-white transition-colors"
            >
              I&apos;ve already starred it, continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
