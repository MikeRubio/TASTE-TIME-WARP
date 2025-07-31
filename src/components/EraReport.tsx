import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Music, 
  Film, 
  UtensilsCrossed, 
  Shirt, 
  Plane, 
  ArrowLeft, 
  Share2, 
  RotateCcw,
  ExternalLink,
  Linkedin,
  Calendar,
  Info
} from 'lucide-react';
import { getWarp } from '../lib/supabase';
import { WarpData } from '../types';
import { loadFromStorage, STORAGE_KEYS } from '../lib/storage';

const CATEGORY_ICONS = {
  music: Music,
  film: Film,
  food: UtensilsCrossed,
  fashion: Shirt,
  travel: Plane,
};

const CATEGORY_LABELS = {
  music: 'Song',
  film: 'Film',
  food: 'Dish',
  fashion: 'Fashion',
  travel: 'Travel',
};

export default function EraReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [warpData, setWarpData] = useState<WarpData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModern, setShowModern] = useState(false);
  const [expandedEssay, setExpandedEssay] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadWarp = async () => {
      try {
        const data = await getWarp(id);
        setWarpData(data);
      } catch (err) {
        setError('Failed to load time-warp data');
      } finally {
        setIsLoading(false);
      }
    };

    loadWarp();
  }, [id]);

  const handleWarpAgain = () => {
    const lastSeeds = loadFromStorage(STORAGE_KEYS.LAST_SEEDS, '');
    navigate('/', { state: { preserveSeeds: lastSeeds } });
  };

  const shareWarp = async () => {
    const url = 'https://taste-time-wrap.netlify.app' + window.location.pathname;
    const caption = generateShareCaption();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Taste Time-Warp to ${warpData?.target_year}`,
          text: caption,
          url,
        });
      } catch (err) {
        // Fallback to copy
        navigator.clipboard.writeText(`${caption}\n\n${url}`);
      }
    } else {
      navigator.clipboard.writeText(`${caption}\n\n${url}`);
    }
  };

  const shareTwitter = () => {
    const caption = generateShareCaption();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent('https://taste-time-wrap.netlify.app' + window.location.pathname)}`;
    window.open(url, '_blank');
  };

  const shareLinkedIn = () => {
    const caption = generateShareCaption();
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://taste-time-wrap.netlify.app' + window.location.pathname)}&summary=${encodeURIComponent(caption)}`;
    window.open(url, '_blank');
  };

  const generateShareCaption = () => {
    if (!warpData) return "Check out my time-warp results! 🚀";
    
    const { bundle, target_year } = warpData;
    
    // Get 2-3 interesting recommendations to highlight
    const highlights = [];
    if (bundle.music) highlights.push(bundle.music);
    if (bundle.fashion) highlights.push(bundle.fashion);
    if (bundle.food && highlights.length < 3) highlights.push(bundle.food);
    if (bundle.travel && highlights.length < 3) highlights.push(bundle.travel);
    if (bundle.film && highlights.length < 3) highlights.push(bundle.film);
    
    // Create a catchy caption
    const highlightText = highlights.slice(0, 3).join(', ');
    
    const captions = [
      `If I was born in ${target_year}, I'd be into ${highlightText}. What about you? 🚀`,
      `Just discovered my ${target_year} taste: ${highlightText}! Time-warp yours! ✨`,
      `My ${target_year} vibe would be ${highlightText}. What's your era? 🎭`,
      `Turns out in ${target_year}, I'd love ${highlightText}. Try your time-warp! 🌟`,
      `AI says my ${target_year} taste = ${highlightText}. What would yours be? 🚀`
    ];
    
    // Pick a random caption for variety
    return captions[Math.floor(Math.random() * captions.length)];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error || !warpData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-mono text-red-400 mb-4">ERROR</h2>
          <p className="text-slate-300 mb-6">{error || 'Warp not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-cyan-500 text-slate-900 font-mono px-6 py-3 rounded-lg hover:bg-cyan-400 transition-colors"
          >
            Return to Console
          </button>
        </div>
      </div>
    );
  }

  const getDivergenceColor = (divergence: number) => {
    if (divergence < 33) return 'from-green-400 to-green-500';
    if (divergence < 66) return 'from-yellow-400 to-orange-500';
    return 'from-orange-500 to-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-magenta-500/5" />
        <div className="stars-background" />
      </div>

      {/* Scanline overlay */}
      <div className="absolute inset-0 bg-scan-lines opacity-3 pointer-events-none" />

      <div className="relative z-10 p-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 max-w-6xl mx-auto"
        >
          <button
            onClick={() => navigate('/console')}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            CONSOLE
          </button>

          <div className="flex items-center gap-2 text-cyan-400">
            <Calendar className="w-5 h-5" />
            <span className="font-bold text-2xl">{warpData.target_year}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={shareWarp}
              className="p-2 text-slate-400 hover:text-cyan-400 transition-colors"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={shareTwitter}
              className="p-2 text-slate-400 hover:text-cyan-400 transition-colors"
              title="Share on Twitter/X"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
            <button
              onClick={shareLinkedIn}
              className="p-2 text-slate-400 hover:text-cyan-400 transition-colors"
              title="Share on LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
          {/* Main Recommendations Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 shadow-2xl">
              {/* Toggle Button */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-cyan-400 tracking-wide">
                  {showModern ? '2025 EQUIVALENTS' : `${warpData.target_year} RECOMMENDATIONS`}
                </h2>
                <motion.button
                  onClick={() => setShowModern(!showModern)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-semibold ${
                    showModern 
                      ? 'bg-gradient-to-r from-magenta-500 to-magenta-400 text-white' 
                      : 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900'
                  }`}
                >
                  <RotateCcw className="w-4 h-4" />
                  {showModern ? 'SHOW VINTAGE' : 'SHOW MODERN'}
                </motion.button>
              </div>

              {/* Recommendations Grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={showModern ? 'modern' : 'vintage'}
                  initial={{ opacity: 0, rotateY: 90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: -90 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                    const Icon = CATEGORY_ICONS[key as keyof typeof CATEGORY_ICONS];
                    const recommendation = showModern 
                      ? warpData.bundle.modern_equivalents[key as keyof typeof warpData.bundle.modern_equivalents]
                      : warpData.bundle[key as keyof Omit<typeof warpData.bundle, 'modern_equivalents'>];

                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * Object.keys(CATEGORY_LABELS).indexOf(key) }}
                        className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-cyan-500/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-6 h-6 text-cyan-400" />
                          <div>
                            <div className="text-cyan-300 font-semibold text-sm">{label}</div>
                            <div className="text-slate-100 text-lg">{recommendation}</div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Essay Card */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-xl text-cyan-400">CULTURAL CONTEXT</h3>
                <div className="relative">
                  <button
                    onMouseEnter={() => setShowInfoTooltip(true)}
                    onMouseLeave={() => setShowInfoTooltip(false)}
                    className="text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  {showInfoTooltip && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 border border-cyan-500/30 rounded-lg text-xs text-slate-300 whitespace-nowrap z-50">
                      Selected based on your input and cross-domain affinities
                    </div>
                  )}
                </div>
              </div>
              <div className={`text-slate-300 leading-relaxed ${!expandedEssay && warpData.essay.length > 200 ? 'line-clamp-4' : ''}`}>
                {warpData.essay}
              </div>
              {warpData.essay.length > 200 && (
                <button
                  onClick={() => setExpandedEssay(!expandedEssay)}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm mt-2 transition-colors"
                >
                  {expandedEssay ? 'SHOW LESS' : 'READ MORE'}
                </button>
              )}
            </div>

            {/* Divergence Meter */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl text-cyan-400 mb-4">ERA SIMILARITY TO TODAY</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-300">SIMILARITY TO 2025</span>
                  <span className="font-bold text-cyan-400 text-lg">{100 - warpData.divergence}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${100 - warpData.divergence}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full bg-gradient-to-r ${getDivergenceColor(warpData.divergence)}`}
                  />
                </div>
                <div className="text-slate-400 text-sm font-medium">
                  {warpData.divergence < 33 && "This year feels pretty close to today."}
                  {warpData.divergence >= 33 && warpData.divergence < 66 && "Noticeably different era"}
                  {warpData.divergence >= 66 && "A world away from modern trends!"}
                </div>
              </div>
            </div>

            {/* Warp Again Button */}
            <motion.button
              onClick={handleWarpAgain}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-magenta-500 to-magenta-400 text-white font-bold py-4 px-6 rounded-xl hover:from-magenta-400 hover:to-magenta-300 transition-all"
            >
              WARP AGAIN 🚀
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}