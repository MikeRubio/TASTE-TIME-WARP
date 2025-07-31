import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Rocket, Calendar, Sparkles, X, Search, RotateCcw, User, CheckCircle } from 'lucide-react';
import Confetti from 'react-confetti';
import { createWarp, searchQlooEntities } from '../lib/supabase';
import { saveToStorage, loadFromStorage, removeFromStorage, STORAGE_KEYS } from '../lib/storage';
import { QlooEntity, CategoryFavorites } from '../types';
import { CATEGORY_CONFIGS, mapEntityToCategory, getCategoryConfig } from '../lib/categoryMapping';

// --- CategorySeedSelector subcomponent ---
function CategorySeedSelector({ selectedCategoryFavorites, setSelectedCategoryFavorites, error, setError }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Get current category being filled
  const currentCategory = CATEGORY_CONFIGS[currentCategoryIndex];
  const isComplete = Object.values(selectedCategoryFavorites).filter(Boolean).length === 5;

  // Auto-advance to next empty category when one is filled
  useEffect(() => {
    if (isComplete) return;
    
    const nextEmptyIndex = CATEGORY_CONFIGS.findIndex(config => 
      !selectedCategoryFavorites[config.key]
    );
    
    if (nextEmptyIndex !== -1 && nextEmptyIndex !== currentCategoryIndex) {
      setCurrentCategoryIndex(nextEmptyIndex);
      setSearchQuery('');
      setSearchResults([]);
      setError('');
    }
  }, [selectedCategoryFavorites, currentCategoryIndex, isComplete]);
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

        // Filter results to only show entities that match the current category
        const filteredResults = Array.isArray(results)
          ? results.filter(result => {
              if (!result) {
                return false;
              }
              if (!result.id) {
                result.id = `temp-${result.name}-${Date.now()}`;
              }
              if (!result.type) {
                result.type = 'unknown';
              }
              
              // Filter by current category type
              const entityType = result.type.toLowerCase();
              const matchesCategory = currentCategory.qlooTypes.some(type => 
                entityType.includes(type.toLowerCase().replace('urn:entity:', ''))
              );
              
              if (!matchesCategory) {
                return false;
              }
              
              // Check for duplicates
              const allSelected = Object.values(selectedCategoryFavorites).filter(Boolean);
              return !allSelected.some(fav => fav && fav.id === result.id);
            })
          : [];

        setSearchResults(filteredResults);
        setHighlightedIdx(0);
      } catch (e) {
        if (!isCancelled) setSearchResults([]);
      } finally {
        if (!isCancelled) setIsSearching(false);
      }
    }, 400);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [searchQuery, selectedCategoryFavorites, currentCategory]);

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
    // Since we're filtering by category, we know this entity belongs to the current category
    const categoryKey = currentCategory.key;
    
    if (selectedCategoryFavorites[categoryKey]) {
      setError && setError(`You already have a ${currentCategory.label.toLowerCase()} selected. Remove it first to add a new one.`);
      return;
    }
    
    // Check for duplicates across all categories
    const allSelected = Object.values(selectedCategoryFavorites).filter(Boolean);
    const isDuplicate = allSelected.some(f => {
      if (!f) return false;
      if (f.id && entity.id && f.id === entity.id) return true;
      if (f.name && entity.name && f.name === entity.name) return true;
      return false;
    });
    
    if (isDuplicate) {
      setError && setError(`"${entity.name}" is already selected.`);
      return;
    }
    
    setSelectedCategoryFavorites({
      ...selectedCategoryFavorites,
      [categoryKey]: entity
    });
    setShowDropdown(false);
    setTimeout(() => {
      setSearchQuery('');
      setSearchResults([]);
      inputRef.current?.focus();
    }, 150);
    setError && setError('');
  };

  const removeFavorite = (categoryKey) => {
    setSelectedCategoryFavorites({
      ...selectedCategoryFavorites,
      [categoryKey]: undefined
    });
    setError && setError('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const goToCategory = (index) => {
    setCurrentCategoryIndex(index);
    setSearchQuery('');
    setSearchResults([]);
    setError('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  if (isComplete) {
    return (
      <div>
        <label className="block text-cyan-300 font-mono text-sm mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          All Categories Complete! 🎉
        </label>
        
        {/* Completed Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {CATEGORY_CONFIGS.map((config, index) => {
            const Icon = config.icon;
            const selected = selectedCategoryFavorites[config.key];
            return (
              <div
                key={config.key}
                className="bg-green-500/10 border border-green-500/50 rounded-lg p-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-300">{config.label}</span>
                  <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-100 font-medium text-sm">{selected?.name}</div>
                    <div className="text-slate-400 text-xs">{selected?.type}</div>
                  </div>
                  <button
                    onClick={() => removeFavorite(config.key)}
                    className="text-slate-400 hover:text-red-400 transition-colors p-1"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="text-center text-slate-300 text-sm">
          Ready to generate your time-warp! 🚀
        </div>
      </div>
    );
  }
  return (
    <div>
      <label className="block text-cyan-300 font-mono text-sm mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4" />
        Step {currentCategoryIndex + 1}/5: Choose Your {currentCategory.label}
      </label>
      
      {/* Progress indicator */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          {CATEGORY_CONFIGS.map((config, index) => {
            const Icon = config.icon;
            const isActive = index === currentCategoryIndex;
            const isCompleted = selectedCategoryFavorites[config.key];
            const isPast = index < currentCategoryIndex;
            
            return (
              <button
                key={config.key}
                onClick={() => goToCategory(index)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isCompleted 
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                    : isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'bg-slate-800/30 text-slate-400 border border-slate-700/30 hover:border-slate-600/50'
                }`}
              >
                <Icon className="w-3 h-3" />
                {isCompleted ? <CheckCircle className="w-3 h-3" /> : index + 1}
              </button>
            );
          })}
        </div>
        <div className="text-xs text-slate-400">
          {Object.values(selectedCategoryFavorites).filter(Boolean).length}/5 categories completed
        </div>
      </div>
      
      {/* Current Category Info */}
      <div className="mb-4 bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <currentCategory.icon className="w-5 h-5 text-cyan-400" />
          <span className="font-semibold text-cyan-300">{currentCategory.label}</span>
        </div>
        <div className="text-xs text-slate-400">
          {currentCategory.key === 'music' && "Search for your favorite artist or band (e.g., Beyoncé, The Beatles, Taylor Swift)"}
          {currentCategory.key === 'film' && "Search for a movie you love (e.g., Back to the Future, Titanic, Avengers)"}
          {currentCategory.key === 'food' && "Search for a restaurant or cuisine you enjoy (e.g., McDonald's, Chez Panisse, Italian food)"}
          {currentCategory.key === 'fashion' && "Search for a fashion brand you like (e.g., Nike, Gucci, Zara)"}
          {currentCategory.key === 'travel' && "Search for a destination you'd love to visit (e.g., Paris, Tokyo, New York)"}
        </div>
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
          placeholder={currentCategory.placeholder}
          className="w-full bg-slate-800/50 border border-cyan-500/30 rounded-xl pl-10 pr-4 py-3 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all text-sm"
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
                No {currentCategory.label.toLowerCase()}s found. Try a different search term.
              </div>
            )}
            {searchResults.map((result, idx) => (
              <button
                key={result.id || result.name || idx}
                onMouseDown={() => addFavorite(result)}
                onMouseEnter={() => setHighlightedIdx(idx)}
                className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-cyan-500/10 transition-colors border-b border-slate-700/50 last:border-b-0 
                  ${idx === highlightedIdx ? 'bg-cyan-700/30' : ''}`}
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
        <span>
          Showing only {currentCategory.label.toLowerCase()}s
        </span>
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
  const [selectedCategoryFavorites, setSelectedCategoryFavorites] = useState<CategoryFavorites>({});
  const [userName, setUserName] = useState('');
  const [targetYear, setTargetYear] = useState(1985);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load previous inputs from localStorage
    const lastCategoryFavorites = loadFromStorage(STORAGE_KEYS.LAST_CATEGORY_FAVORITES, {});
    const lastUserName = loadFromStorage('taste-timewarp-last-username', '');
    const lastYear = loadFromStorage(STORAGE_KEYS.LAST_YEAR, 1985);
    
    if (typeof lastCategoryFavorites === 'object' && lastCategoryFavorites !== null) {
      setSelectedCategoryFavorites(lastCategoryFavorites);
    }
    if (lastUserName) setUserName(lastUserName);
    if (lastYear) setTargetYear(lastYear);
  }, []);

  const handleClearAll = () => {
    setSelectedCategoryFavorites({});
    setUserName('');
    setTargetYear(1985);
    setError('');
    // Clear localStorage
    removeFromStorage(STORAGE_KEYS.LAST_CATEGORY_FAVORITES);
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
    
    const selectedEntities = Object.values(selectedCategoryFavorites).filter(Boolean);
    
    if (selectedEntities.length > 4) {
      setError('Please select a maximum of 4 favorites. Remove some selections to continue.');
      return;
    }
    
    if (selectedEntities.length === 0) {
      setError('Please select at least one favorite from the search results');
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
      saveToStorage(STORAGE_KEYS.LAST_CATEGORY_FAVORITES, selectedCategoryFavorites);
      saveToStorage('taste-timewarp-last-username', userName);
      saveToStorage(STORAGE_KEYS.LAST_YEAR, targetYear);
      const warpId = await createWarp(selectedEntities, targetYear, userName);
      
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
              
              <CategorySeedSelector
                selectedCategoryFavorites={selectedCategoryFavorites}
                setSelectedCategoryFavorites={setSelectedCategoryFavorites}
                error={error}
                setError={setError}
              />
              {/* Year Slider */}
              <div>
                <label className="block text-cyan-300 font-semibold text-sm mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Jump to any year — <span className="font-bold text-lg text-cyan-400">{targetYear}</span>
                  {Object.values(selectedCategoryFavorites).filter(Boolean).length > 0 && (
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