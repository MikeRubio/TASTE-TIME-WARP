# 🚀 TASTE TIME-WARP

_Transform your modern favorites into era-appropriate recommendations across music, film, food, fashion, and travel—powered by Qloo’s cultural intelligence API and OpenAI LLMs._

<img width="1455" height="1193" alt="image" src="https://github.com/user-attachments/assets/063603fd-4324-408a-a7fa-f90199392cc8" />

---

## 🎯 What is Taste Time-Warp?

Taste Time-Warp is an interactive app that lets you see what your taste would look like in any year from 1900 to 2025.  
Pick your favorite artists, movies, brands, restaurants, or destinations—and watch as AI time-travels your taste, uncovering the cultural equivalents of any era.

Built for the [Qloo + OpenAI Hackathon](https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide).

---

## ✨ Features

- **AI-powered Era Recommendations:**  
  Discover music, movies, dishes, fashion, and travel picks for any decade—personalized to your modern taste.
- **Cross-domain Intelligence:**  
  Uses Qloo’s API to map affinities across different cultural domains, not just simple genre/category lookups.
- **Cultural Context Essays:**  
  OpenAI generates concise, insightful context for every year and recommendation bundle.
- **Similarity Meter:**  
  See how close (or different) your chosen year feels compared to today with our “Divergence Index.”
- **Instant, Fun UX:**  
  Designed for playful rapid exploration—see results with a single click, then tweak, share, or "warp again."
- **Multiple Use Cases:**  
  - Entertainment/Streaming: “What would I have watched in the ‘70s?”
  - Education/Museums: Make history personal and interactive
  - Trend Forecasting: Explore cyclical trends and nostalgia triggers
  - World-Building: Great for writers, filmmakers, game designers

---

## 🛠️ How It Works

1. **Pick up to 4 favorites:**  
   Artists, movies, restaurants, brands, or places you love.
2. **Choose a target year:**  
   Anywhere from 1900 to 2025.
3. **Hit “Generate Time-Warp”:**  
   - Qloo API finds cross-domain matches and cultural affinities.
   - OpenAI LLM writes a short, era-specific context essay.
   - Divergence Index calculates similarity to the present.
4. **Explore and Share:**  
   See your taste “backcasted” into any era. Share results, or warp again!

---

## 🧠 Tech Stack

- **Frontend:** React, Tailwind CSS, Framer Motion
- **Backend:** Supabase Edge Functions (Deno), Qloo API, OpenAI API
- **Database:** Supabase
- **Other:** TypeScript, JWT Auth, localStorage, fully responsive UI

---

## 🤖 Qloo + LLM Integration

- **Qloo API:**  
  - Real cross-domain cultural mapping (music, film, food, fashion, travel)
  - “Taste Graph” approach—more than just metadata
- **OpenAI LLM:**  
  - Synthesizes era essays and context blurbs for recommendations
  - Enables playful, informative microcopy and summaries

**Privacy-first:** No user data stored beyond explicit saved results.

---

## 💡 Potential & Real-World Value

- **For users:** Nostalgia, discovery, personalized learning, and creative inspiration.
- **For business:**  
  - New engagement/retention tool for entertainment platforms, streaming, brands
  - B2B widgets for research, trendspotting, creative writing, or education
- **For culture:**  
  - Helps bridge generational gaps
  - Makes AI-driven cultural intelligence fun and accessible

---

## 🏆 Inspiration

Built for the Qloo + OpenAI Hackathon, inspired by the question:
> “If Spotify Wrapped existed in 1975, what would it show me?”

We wanted to build an app that was more than just recommendations—something that lets you _play with culture_, and feel how taste evolves across time.

---

## 🚀 Try It Yourself

1. **Clone this repo**  
   `git clone https://github.com/yourusername/taste-time-warp.git`
2. **Install dependencies**  
   `npm install`
3. **Set up environment variables**  
   - `VITE_SUPABASE_URL=...`
   - `VITE_SUPABASE_ANON_KEY=...`
   - `QLOO_API_KEY=...`
   - `OPENAI_API_KEY=...`
4. **Run locally**  
   `npm run dev`
5. **Or visit the live demo:** [taste-time-wrap.netlify.app](taste-time-wrap.netlify.app)
---

## 🤝 Credits

- [Qloo](https://qloo.com/)
- [OpenAI](https://openai.com/)
- Supabase, React, Tailwind, and all the open-source magic

---

## 📢 License

MIT License

---

*Made with 💙 for the Qloo LLM Hackathon*
