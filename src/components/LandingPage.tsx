import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Rocket, 
  Play, 
  GraduationCap, 
  TrendingUp, 
  PenTool,
  Sparkles,
  Users,
  Brain,
  Zap,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [showAbout, setShowAbout] = useState(false);

  const useCases = [
    {
      icon: Play,
      title: "Entertainment & Streaming Platforms",
      subtitle: "Experience your taste across decades",
      description: "Preview your modern playlists, watchlists, or favorites as they would have appeared in the 1970s, 1950s, or any era.",
      why: "Engage audiences with interactive nostalgia, expand catalog discovery, and inspire themed playlists or throwback events.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: GraduationCap,
      title: "Cultural Education & Museums",
      subtitle: "Make history personal and interactive",
      description: "Let visitors \"remix\" their favorites and explore cross-domain cultural connections (music, fashion, food, travel) for any historical period.",
      why: "Transform passive learning into personalized exploration, bridging generations through pop culture and making history engaging.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: TrendingUp,
      title: "Trend Forecasting & Brand Innovation",
      subtitle: "Uncover cyclical trends and cultural patterns",
      description: "\"Backcast\" modern preferences into past contexts to discover cyclical trends, nostalgia triggers, and untapped cultural connections.",
      why: "Unlock new approaches to cultural research, identify revival opportunities, and discover unexplored cross-domain fusions for campaigns.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: PenTool,
      title: "Creative Writing, Filmmaking & Game Design",
      subtitle: "Build authentic, immersive worlds",
      description: "Get accurate, multi-domain inspiration for any era (\"What would a 1920s Arcane fan eat, listen to, and wear?\").",
      why: "Create authentic, immersive worlds for historical fiction, alternate timelines, and speculative design with cultural accuracy.",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const features = [
    {
      icon: Brain,
      title: "Culturally Intelligent Personalization",
      description: "Every recommendation is backed by real-world cross-domain affinities (Qloo) and smartly contextualized with generative AI."
    },
    {
      icon: Users,
      title: "Unlock Deeper Engagement",
      description: "Bridge past and present tastes—drive engagement, spark nostalgia, and make content discovery an adventure."
    },
    {
      icon: Zap,
      title: "Ready for Business or Play",
      description: "Embed as a fun widget or use as a B2B tool for deeper customer insights, branded experiences, and more."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-magenta-500/10" />
        <div className="stars-background" />
        <div className="grid-horizon" />
      </div>

      {/* Scanline overlay */}
      <div className="absolute inset-0 bg-scan-lines opacity-5 pointer-events-none" />

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Rocket className="w-12 h-12 text-cyan-400" />
              <h1 className="text-5xl md:text-7xl font-bold text-cyan-400" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                TASTE TIME-WARP
              </h1>
              <Rocket className="w-12 h-12 text-cyan-400 scale-x-[-1]" />
            </div>
            
            <motion.p 
              className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Discover what you would have loved in any era. Instantly translate your favorite music, movies, foods, and brands to any year from 1900 to 2025—powered by AI and cultural intelligence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">
                TRY IT NOW—FREE
              </h2>
              <p className="text-lg text-slate-300">
                Instantly see how your favorites would fit any decade. Dive into the Time-Warp Console and discover your alternate-taste history.
              </p>
            </motion.div>

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.6 }}
  className="flex flex-col items-center"
>
  <button
    onClick={() => navigate('/console')}
    className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-bold py-4 px-8 rounded-xl hover:from-cyan-400 hover:to-cyan-300 transition-all text-lg flex items-center gap-2 group"
  >
    TRY TIME-WARP 🚀
    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
  </button>
  <div className="text-slate-400 text-sm mt-2">
    Powered by <span className="text-cyan-400">Qloo</span> ♥︎ <span className="text-cyan-400">OpenAI</span>
  </div>
</motion.div>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6">
                <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <h3 className="font-semibold text-cyan-300 mb-2">AI-Powered</h3>
                <p className="text-slate-400 text-sm">Advanced cultural intelligence meets personalized recommendations</p>
              </div>
              <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6">
                <Users className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <h3 className="font-semibold text-cyan-300 mb-2">Cross-Domain</h3>
                <p className="text-slate-400 text-sm">Music, film, food, fashion, and travel recommendations in one place</p>
              </div>
              <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6">
                <Brain className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <h3 className="font-semibold text-cyan-300 mb-2">Contextual</h3>
                <p className="text-slate-400 text-sm">Not random—based on real cultural affinities and historical context</p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Use Cases Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-6">
                WHO IS THIS FOR?
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Time-Warp unlocks new possibilities for anyone—from streaming platforms and museums to marketers and creatives—looking to personalize cultural discovery or spark inspiration.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {useCases.map((useCase, index) => {
                const Icon = useCase.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 hover:border-cyan-500/40 transition-all group"
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${useCase.gradient} bg-opacity-20`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-cyan-300 mb-2">
                          {useCase.title}
                        </h3>
                        <p className="text-cyan-400 font-medium mb-3">
                          {useCase.subtitle}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-slate-300 mb-4 leading-relaxed">
                      {useCase.description}
                    </p>
                    
                    <div className="border-t border-slate-700/50 pt-4">
                      <p className="text-sm text-slate-400 leading-relaxed">
                        <span className="text-cyan-400 font-medium">Why it matters:</span> {useCase.why}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* What Makes This More Than a Toy Section */}
        <section className="py-20 px-4 bg-slate-900/30">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-6">
                MORE THAN A TOY
              </h2>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-4">
                Built for both fun and function, Time-Warp is a serious tool for cultural research, creative inspiration, and next-generation recommendation systems.
              </p>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                These aren't just features—they're differentiators that set Time-Warp apart.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 text-center hover:border-cyan-500/40 transition-all"
                  >
                    <Icon className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-cyan-300 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-6">
              READY TO TIME-WARP?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Experience the future of cultural discovery. Transform your taste across decades and unlock new creative possibilities.
            </p>
            <button
              onClick={() => navigate('/console')}
              className="bg-gradient-to-r from-magenta-500 to-magenta-400 text-white font-bold py-6 px-12 rounded-xl hover:from-magenta-400 hover:to-magenta-300 transition-all text-xl flex items-center gap-3 mx-auto group"
            >
              LAUNCH TIME-WARP CONSOLE 🚀
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </section>

        {/* Footer with About Section */}
        <footer className="py-12 px-4 border-t border-slate-700/50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <button
                onClick={() => setShowAbout(!showAbout)}
                className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mx-auto font-semibold"
              >
                <HelpCircle className="w-5 h-5" />
                What is this?
                {showAbout ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
            
            {showAbout && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 text-slate-300"
              >
                <div className="space-y-4 text-sm leading-relaxed">
                  <div>
                    <h4 className="font-semibold text-cyan-300 mb-2">About This Project</h4>
                    <p>
                      Taste Time-Warp was built for a hackathon, combining the power of Qloo's cultural intelligence API 
                      with OpenAI's generative capabilities to create personalized, era-appropriate recommendations.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-cyan-300 mb-2">How It Works</h4>
                    <p>
                      We use Qloo's real-world cultural affinity data to understand cross-domain connections between 
                      your favorites, then apply AI to contextualize these relationships within specific historical periods, 
                      creating authentic recommendations that feel true to both your taste and the target era.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-cyan-300 mb-2">Privacy & Data</h4>
                    <p>
                      Your search queries and preferences are used only to generate recommendations. We store anonymized 
                      results to improve the experience, but don't track personal information or share data with third parties.
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-700/50 text-center">
                    <p className="text-slate-400">
                      Powered by <span className="text-cyan-400 font-semibold">Qloo</span> ♥︎ <span className="text-cyan-400 font-semibold">OpenAI</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}