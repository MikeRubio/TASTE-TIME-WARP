import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Rocket, Calendar, Sparkles, X, Search, RotateCcw, User } from 'lucide-react';
import Confetti from 'react-confetti';
import { createWarp, searchQlooEntities } from '../lib/supabase';
import { saveToStorage, loadFromStorage, removeFromStorage, STORAGE_KEYS } from '../lib/storage';
import { QlooEntity } from '../types';

// --- QlooSeedSelector subcomponent ---
function QlooSeedSelector({ selectedFavorites, setSelectedFavorites, error, setError }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      setShowDropdown(false);
      return;
    }

    let isCancelled = false;
    setIsSearching(true);
    setShowDropdown(true);

    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchQlooEntities(searchQuery);
        console.log('[Qloo] API results:', results);
        console.log('[Qloo] API results type:', typeof results);
        console.log('[Qloo] API results length:', Array.isArray(results) ? results.length : 'not array');
        console.log('[Qloo] Current selectedFavorites:', selectedFavorites);

        // Patch: Accept both string/object results just in case!
        const filteredResults = Array.isArray(results)
          ? results.filter(result => {
              console.log('[Qloo] Processing result:', result);
              
              // Warn about missing required fields
              if (!result) {
                console.warn('[Qloo] Null/undefined result found');
                return false;
              }
              if (!result.id) {
                console.warn('[Qloo] Result missing ID:', result);
                // Allow results without ID for now, but generate a temporary one
                result.id = `temp-${result.name}-${Date.now()}`;
              }
              if (!result.type) {
                console.warn('[Qloo] Result missing type:', result);
                // Try to infer type from name or set a more descriptive default
                if (result.name.toLowerCase().includes('restaurant') || result.name.toLowerCase().includes('grill') || result.name.toLowerCase().includes('bistro') || result.name.toLowerCase().includes('bar')) {
                  result.type = 'restaurant';
                } else if (result.name.toLowerCase().includes('airport') || result.name.toLowerCase().includes('hotel') || result.name.toLowerCase().includes('resort')) {
                  result.type = 'travel';
                } else if (result.name.toLowerCase().includes('tour') || result.name.toLowerCase().includes('excursion')) {
                  result.type = 'activity';
                } else {
                  result.type = 'place';
                }
              }
              
              // Check for duplicates using both id and name as fallback
              return !selectedFavorites.some(fav => fav && fav.id === result.id);
            })
          : [];

        console.log('[Qloo] Filtered results:', filteredResults);
        console.log('[Qloo] Filtered results length:', filteredResults.length);
        setSearchResults(filteredResults);
        setHighlightedIdx(0);
      } catch (e) {
        if (!isCancelled) setSearchResults([]);
      } finally {
        if (!isCancelled) setIsSearching(false);
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [searchQuery, selectedFavorites]);

  // Click outside closes dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
        setHighlightedIdx(0);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!showDropdown || searchResults.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIdx(prev => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIdx(prev => (prev === 0 ? searchResults.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[highlightedIdx]) {
        addFavorite(searchResults[highlightedIdx]);
      }
    }
  };

  const addFavorite = (entity) => {
    if (selectedFavorites.length >= 4) return;
    
    // Prevent duplicates using both id and name as fallback
    const isDuplicate = selectedFavorites.some(f => {
      if (!f) return false;
      // Primary check: by ID
      if (f.id && entity.id && f.id === entity.id) return true;
      // Fallback check: by name if ID is missing
      if (f.name && entity.name && f.name === entity.name) return true;
      return false;
    });
    
    if (isDuplicate) {
      console.log('[Qloo] Duplicate entity detected:', entity);
      return;
    }
    
    setSelectedFavorites([...selectedFavorites, entity]);
    setShowDropdown(false);
    setTimeout(() => {
      setSearchQuery('');
      setSearchResults([]);
      inputRef.current?.focus();
    }, 150); // Slight delay so dropdown closes before clearing
    setError && setError('');
  };

  const removeFavorite = (entityId) => {
    setSelectedFavorites(selectedFavorites.filter(f => f && f.id !== entityId));
    setError && setError('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div>
      <label className="block text-cyan-300 font-mono text-sm mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4" />
        Pick Your Modern Favorites
      </label>
      <div className="mb-3 text-xs text-slate-400 bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
        <span className="font-semibold text-cyan-300">What are 'Favorites'?</span> — Songs, films, food, brands, or destinations you love today. We'll find their era counterparts!
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedFavorites.map((favorite) => (
          <div
            key={favorite.id}
            className="bg-cyan-500/20 border border-cyan-500/40 rounded-full px-3 py-1 flex items-center gap-2 text-sm"
          >
            <span className="text-cyan-100">{favorite.name}</span>
            <span className="text-cyan-300/70 text-xs">({favorite.type})</span>
            <button
              onClick={() => removeFavorite(favorite.id)}
              className="text-cyan-300 hover:text-red-400 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          ref={inputRef}
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value);
            setShowDropdown(true);
            setHighlightedIdx(0);
          }}
          onFocus={() => {
            setShowDropdown(true);
            setHighlightedIdx(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedFavorites.length >= 4
              ? "Maximum 4 favorites selected"
              : "Choose up to 4 favorites—artists, movies, food, brands, or places you love."
          }
          disabled={selectedFavorites.length >= 4}
          className="w-full bg-slate-800/50 border border-cyan-500/30 rounded-xl pl-10 pr-4 py-3 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {isSearching && (
          <div
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"
          />
        )}
        {showDropdown && searchQuery.length >= 2 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-2 bg-slate-800/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl max-h-60 overflow-y-auto"
          >
            {searchResults.length === 0 && !isSearching && (
              <div className="p-4 text-center text-slate-400">
                No results found. Try searching for artists, movies, restaurants, brands, or places.
              </div>
            )}
            {searchResults.map((result, idx) => (
              <button
                key={result.id || result.name || idx}
                onMouseDown={() => addFavorite(result)}
                onMouseEnter={() => setHighlightedIdx(idx)}
                className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-cyan-500/10 transition-colors border-b border-slate-700/50 last:border-b-0 
                  ${idx === highlightedIdx ? 'bg-cyan-700/30' : ''}`}
                disabled={selectedFavorites.length >= 4}
              >
                <div>
                  <div className="text-slate-100 font-medium">{result.name}</div>
                  <div className="text-cyan-300/70 text-sm capitalize">{result.type}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Helper Text */}
      <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
        <span>Choose up to 4 favorites—artists, movies, food, brands, or places you love.</span>
        <span className="text-cyan-400/70">powered by Qloo search</span>
      </div>
      {error && (
        <div className="text-red-400 text-xs mt-2">{error}</div>
      )}
    </div>
  );
}

// --- Main WarpConsole Component ---
export default function WarpConsole() {
  const navigate = useNavigate();
  const [selectedFavorites, setSelectedFavorites] = useState<QlooEntity[]>([]);
  const [userName, setUserName] = useState('');
  const [targetYear, setTargetYear] = useState(1985);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load previous inputs from localStorage
    const lastFavorites = loadFromStorage(STORAGE_KEYS.LAST_FAVORITES, []);
    const lastUserName = loadFromStorage('taste-timewarp-last-username', '');
    const lastYear = loadFromStorage(STORAGE_KEYS.LAST_YEAR, 1985);
    if (Array.isArray(lastFavorites) && lastFavorites.every(f => typeof f === 'object' && f.id)) {
      setSelectedFavorites(lastFavorites);
    } else {
      setSelectedFavorites([]);
    }
    if (lastUserName) setUserName(lastUserName);
    if (lastYear) setTargetYear(lastYear);
  }, []);

  const handleClearAll = () => {
    setSelectedFavorites([]);
    setUserName('');
    setTargetYear(1985);
    setError('');
    // Clear localStorage
    removeFromStorage(STORAGE_KEYS.LAST_FAVORITES);
    removeFromStorage('taste-timewarp-last-username');
    removeFromStorage(STORAGE_KEYS.LAST_YEAR);
    removeFromStorage(STORAGE_KEYS.LAST_SEEDS); // Legacy cleanup
    // Focus the search input after clearing
    setTimeout(() => {
      const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
      searchInput?.focus();
    }, 100);
  };

  const handleWarp = async () => {
    setError('');
    if (selectedFavorites.length === 0) {
      setError('Please select at least one favorite from the search results');
      return;
    }
    if (selectedFavorites.length > 4) {
      setError('Please select no more than 4 favorites');
      return;
    }
    setIsLoading(true);
    
    // Play warp sound effect
    try {
      const audio = new Audio('/warp-sound.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore audio play errors (user interaction required, etc.)
      });
    } catch (error) {
      // Ignore audio errors
    }
    
    try {
      // Save inputs to localStorage
      saveToStorage(STORAGE_KEYS.LAST_FAVORITES, selectedFavorites);
      saveToStorage('taste-timewarp-last-username', userName);
      saveToStorage(STORAGE_KEYS.LAST_YEAR, targetYear);
      const seedNames = selectedFavorites.map(f => f.name);
      const warpId = await createWarp(seedNames, targetYear, userName);
      
      // Show confetti effect
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        navigate(`/w/${warpId}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate time-warp');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          colors={['#06b6d4', '#0891b2', '#e879f9', '#d946ef', '#f59e0b', '#eab308']}
        />
      )}
      
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-magenta-500/10" />
        <div className="stars-background" />
        <div className="grid-horizon" />
      </div>
      {/* Scanline overlay */}
      <div className="absolute inset-0 bg-scan-lines opacity-5 pointer-events-none" />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-2xl"
        >
          {/* Command Deck */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-8 shadow-2xl shadow-cyan-500/10">
            {/* Header */}
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Rocket className="w-8 h-8 text-cyan-400" />
                <h1 className="text-4xl font-bold text-cyan-400 tracking-wide">
                  TASTE TIME-WARP
                </h1>
                <Rocket className="w-8 h-8 text-cyan-400 scale-x-[-1]" />
              </div>
              <p className="text-cyan-300 text-lg font-semibold mb-4">
                Unlock the past, powered by AI.
              </p>
              <p className="text-slate-300 text-lg">
                Transform your modern favorites into era-appropriate recommendations
              </p>
            </motion.div>
            {/* Input Section */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {/* User Name Input */}
              <div>
                <label className="block text-cyan-300 font-semibold text-sm mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name for personalized results"
                  className="w-full bg-slate-800/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                />
                <div className="mt-2 text-xs text-slate-400">
                  We'll personalize your cultural context essay with your name
                </div>
              </div>
              
              <QlooSeedSelector
                selectedFavorites={selectedFavorites}
                setSelectedFavorites={setSelectedFavorites}
                error={error}
                setError={setError}
              />
              {/* Year Slider */}
              <div>
                <label className="block text-cyan-300 font-semibold text-sm mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Jump to any year — <span className="font-bold text-lg text-cyan-400">{targetYear}</span>
                  {selectedFavorites.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="ml-auto text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1"
                      title="Clear all selections"
                    >
                      <RotateCcw className="w-3 h-3" />
                      CLEAR ALL
                    </button>
                  )}
                </label>
                <div className="relative mb-2">
                  {/* Progress fill background */}
                  <div 
                    className="absolute top-1/2 left-0 h-3 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-lg transform -translate-y-1/2 pointer-events-none"
                    style={{ 
                      width: `${((targetYear - 1900) / (2025 - 1900)) * 100}%`,
                      zIndex: 1
                    }}
                  />
                  <input
                    type="range"
                    min="1900"
                    max="2025"
                    value={targetYear}
                    onChange={(e) => setTargetYear(parseInt(e.target.value))}
                    className="w-full slider-cyan relative z-10"
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>1900</span>
                  <span>2025</span>
                </div>
              </div>
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                >
                  {error}
                </motion.div>
              )}
              {/* Warp Button */}
              <motion.button
                onClick={handleWarp}
                disabled={isLoading}
                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0, 229, 255, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-bold py-4 px-8 rounded-xl transition-all hover:from-cyan-400 hover:to-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg group"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full"
                    />
                    GENERATING TIME-WARP...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    GENERATE TIME-WARP 
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      🚀
                    </motion.span>
                  </span>
                )}
              </motion.button>
            </motion.div>
            {/* Footer */}
            <motion.div 
              className="text-center mt-8 pt-6 border-t border-slate-700/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-slate-400 font-medium text-sm">
                Powered by <span className="text-cyan-400">Qloo</span> ♥︎ <span className="text-cyan-400">OpenAI</span>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}