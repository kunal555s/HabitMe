/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, Component, useRef } from 'react';
import { useNavigate, useParams, useLocation, Routes, Route, useNavigationType } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { 
  Search, 
  ArrowRight, 
  Zap, 
  Brain, 
  Moon, 
  Coffee, 
  Target, 
  Shield, 
  Users, 
  Database, 
  Lock, 
  BookOpen, 
  Trophy, 
  Lightbulb,
  Facebook,
  Linkedin,
  Mail,
  Instagram,
  Youtube,
  Twitter,
  Pin,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Share2,
  TrendingUp,
  Activity,
  Clock,
  Flame,
  Award
} from 'lucide-react';
import { 
  AI_TOPICS, 
  BROWSE_TOPICS, 
  FEATURES, 
  HABIT_LOOP, 
  FRAMEWORK 
} from './constants';
import { bloggerService, BloggerPost, BloggerPage } from './services/bloggerService';
import { geminiService } from './services/geminiService';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  serverTimestamp, 
  onSnapshot,
  getDocFromServer,
  collection,
  query,
  orderBy,
  limit,
  where,
  getDocs,
  startAfter,
  getCountFromServer,
  addDoc
} from 'firebase/firestore';

// Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      let message = "Something went wrong.";
      try {
        const errInfo = JSON.parse(this.state.error.message);
        message = `Firestore Error: ${errInfo.error} during ${errInfo.operationType} on ${errInfo.path}`;
      } catch (e) {
        message = this.state.error.message || message;
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white p-8 rounded-sm border border-slate-200 max-w-md w-full shadow-xl">
            <h2 className="text-2xl font-black text-red-600 mb-4 uppercase tracking-tighter">System Error</h2>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">{message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-black text-white font-bold py-3 rounded-sm uppercase tracking-widest text-xs hover:bg-red-600 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


const HabitXpressTool = () => {
  const [goal, setGoal] = useState('');
  const [blueprint, setBlueprint] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateBlueprint = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    setError('');
    setBlueprint(null);

    try {
      const data = await geminiService.generateHabitPlan(goal);
      setBlueprint(data);
    } catch (err) {
      console.error(err);
      setError('Failed to generate blueprint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase">
            HabitXpress <span className="text-red-600">AI Service</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Stop guessing. Start building. Use our elite AI-powered engine to generate a premium habit blueprint in seconds.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-2xl shadow-2xl">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <input 
                type="text" 
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="What habit do you want to build? (e.g. Morning Meditation)"
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
              />
              <button 
                onClick={generateBlueprint}
                disabled={loading || !goal.trim()}
                className="bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white font-black px-8 py-4 rounded-xl uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Generate
              </button>
            </div>

            {error && (
              <div className="text-red-400 text-sm mb-8 text-center bg-red-400/10 py-3 rounded-lg border border-red-400/20">
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              {blueprint && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Difficulty</p>
                      <p className="text-lg font-bold text-red-600">{blueprint.difficulty}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Time</p>
                      <p className="text-lg font-bold">{blueprint.timeCommitment}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 col-span-2 md:col-span-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Keystone</p>
                      <p className="text-sm font-bold">{blueprint.keystoneHabit}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                      <Target className="w-4 h-4" /> Actionable Steps
                    </h4>
                    <div className="space-y-3">
                      {blueprint.steps.map((step: string, i: number) => (
                        <div key={i} className="flex gap-4 items-start bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                          <span className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-black shrink-0">
                            {i + 1}
                          </span>
                          <p className="text-sm leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-600/10 border border-red-600/20 p-6 rounded-xl">
                      <h4 className="text-xs font-black uppercase tracking-widest text-red-600 mb-2">The Reward</h4>
                      <p className="text-sm">{blueprint.reward}</p>
                    </div>
                    <div className="bg-blue-600/10 border border-blue-600/20 p-6 rounded-xl">
                      <h4 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-2 flex items-center gap-2">
                        <Trophy className="w-3 h-3" /> Premium Advice
                      </h4>
                      <p className="text-sm italic text-slate-300">{blueprint.premiumAdvice}</p>
                    </div>
                  </div>

                  {blueprint.graphicData && (
                    <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-red-600" /> Expected Progress Trajectory
                      </h4>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={blueprint.graphicData}>
                            <defs>
                              <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'Day', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'Progress %', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                              itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="expectedProgress" stroke="#dc2626" strokeWidth={3} fillOpacity={1} fill="url(#colorProgress)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {blueprint.scientificInsight && (
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-white/5">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                        <Brain className="w-3 h-3 text-purple-400" /> Scientific Insight
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed italic">"{blueprint.scientificInsight}"</p>
                    </div>
                  )}

                  {blueprint.potentialObstacles && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                        <Shield className="w-3 h-3 text-orange-400" /> Potential Obstacles & Fixes
                      </h4>
                      <div className="grid gap-2">
                        {blueprint.potentialObstacles.map((obs: string, i: number) => (
                          <div key={i} className="text-[10px] text-slate-500 flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
                            <div className="w-1 h-1 rounded-full bg-orange-400" />
                            {obs}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {!blueprint && !loading && (
              <div className="text-center py-12 opacity-40">
                <Brain className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                <p className="text-sm uppercase tracking-widest font-bold">Your Habit Blueprint Will Appear Here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isSendingNewsletter, setIsSendingNewsletter] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Blogger State
  const [posts, setPosts] = useState<BloggerPost[]>(() => {
    const cached = localStorage.getItem('habitxpress_posts_cache');
    return cached ? JSON.parse(cached) : [];
  });
  const [dynamicLabels, setDynamicLabels] = useState<string[]>(() => {
    const cached = localStorage.getItem('habitxpress_labels_cache');
    return cached ? JSON.parse(cached) : [];
  });
  const [labelCounts, setLabelCounts] = useState<Record<string, number>>(() => {
    const cached = localStorage.getItem('habitxpress_label_counts_cache');
    return cached ? JSON.parse(cached) : {};
  });
  const [pages, setPages] = useState<BloggerPage[]>(() => {
    const cached = localStorage.getItem('habitxpress_pages_cache');
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(!posts.length);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<BloggerPost | null>(null);
  const [selectedPage, setSelectedPage] = useState<BloggerPage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [pageTokens, setPageTokens] = useState<(string | undefined)[]>([undefined]);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [jumpPage, setJumpPage] = useState<string>('');
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [selectedAiTopic, setSelectedAiTopic] = useState<string | null>(null);
  const [postEngagement, setPostEngagement] = useState<{ views: number, likes: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [randomSearchPosts, setRandomSearchPosts] = useState<BloggerPost[]>([]);
  
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const prevPathRef = useRef(location.pathname);

  // Authentication State
  useEffect(() => {
    // Test Firestore connection on boot
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'system', 'connection_test'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Firestore is offline. Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        // Check if admin
        const adminEmail = 'kunalsonpitre55555@gmail.com';
        if (currentUser.email === adminEmail) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }

        // Create user document if not exists
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (!userSnap.exists()) {
            await setDoc(userDocRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              role: currentUser.email === adminEmail ? 'admin' : 'user',
              createdAt: new Date().toISOString()
            });
          }
        } catch (userError) {
          console.error("Error creating user document:", userError);
        }

        // Auto-subscribe user on login if not already subscribed
        try {
          const subscriberDocRef = doc(db, 'subscribers', currentUser.email);
          const snapshot = await getDoc(subscriberDocRef);
          
          if (!snapshot.exists()) {
            await setDoc(subscriberDocRef, {
              email: currentUser.email,
              subscribedAt: new Date().toISOString(),
              source: 'google_login'
            });

            // Call backend to send email via Resend
            try {
              await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: currentUser.email }),
              });
            } catch (emailError) {
              console.error('Error sending welcome email:', emailError);
            }
          }
        } catch (error) {
          console.error("Error auto-subscribing user:", error);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;
      
      const adminEmail = 'kunalsonpitre55555@gmail.com';
      if (loggedInUser.email !== adminEmail) {
        // Optional: inform user they are not admin
        // await signOut(auth);
        // alert("Access restricted to Admin only.");
      }
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Admin Dashboard Component
  const AdminDashboard = () => {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSubscribers = async () => {
      setLoading(true);
      try {
        // Fetch all subscribers without limit to ensure "unlimited" view
        const snapshot = await getDocs(collection(db, 'subscribers'));
        setSubscribers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching subscribers:", error);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchSubscribers();
    }, []);

    const exportToExcel = () => {
      if (subscribers.length === 0) return;
      const headers = ['Email', 'Subscribed At', 'Source'];
      const rows = subscribers.map(sub => [
        sub.email,
        new Date(sub.subscribedAt).toLocaleString(),
        sub.source || 'N/A'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `habitxpress_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    // Strict owner check
    const isOwner = user?.email === 'kunalsonpitre55555@gmail.com';
    if (!isOwner) return <div className="p-24 text-center font-black uppercase tracking-widest">Access Restricted to Owner Only</div>;

    return (
      <div className="py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Owner Dashboard</h2>
            <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Subscriber Management</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={fetchSubscribers}
              className="bg-slate-100 text-slate-900 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh List
            </button>
            <button 
              onClick={exportToExcel}
              disabled={subscribers.length === 0}
              className="bg-black text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Database className="w-3.5 h-3.5" /> Export to Excel (CSV)
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-sm overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest">All Subscribers ({subscribers.length})</h3>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="bg-slate-50/50">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100">Email Address</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100">Subscription Date</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={3} className="p-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Loading subscribers...</td></tr>
                ) : subscribers.length === 0 ? (
                  <tr><td colSpan={3} className="p-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">No subscribers found</td></tr>
                ) : (
                  subscribers.map(sub => (
                        <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 text-xs font-bold text-slate-900">{sub.email}</td>
                          <td className="p-4 text-[10px] font-bold text-slate-500 uppercase">{new Date(sub.subscribedAt).toLocaleDateString()}</td>
                          <td className="p-4">
                            <span className="text-[9px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full uppercase tracking-widest">
                              {sub.source || 'Direct'}
                            </span>
                          </td>
                        </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Fetch Blog Info for Favicon
  useEffect(() => {
    const fetchBlogInfo = async () => {
      try {
        const blogInfo = await bloggerService.getBlogInfo();
        if (blogInfo && blogInfo.url) {
          const blogUrl = new URL(blogInfo.url);
          const faviconUrl = `${blogUrl.origin}/favicon.ico`;
          
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = faviconUrl;
        }
      } catch (error) {
        console.error("Failed to fetch blog info for favicon:", error);
      }
    };
    fetchBlogInfo();
  }, []);

  // Routing Logic
  useEffect(() => {
    const path = location.pathname;
    const isPathChanged = prevPathRef.current !== path;
    prevPathRef.current = path;

    const handleDeepLink = async () => {
      if (path === '/') {
        setSelectedPost(null);
        setSelectedCategory(null);
        setSelectedPage(null);
        if (isPathChanged) setCurrentPage(1);
        if (isPathChanged && navigationType !== 'POP') window.scrollTo(0, 0);
      } else if (path.startsWith('/post/')) {
        const slug = path.replace('/post/', '');
        let post = posts.find(p => bloggerService.slugify(p.title) === slug);
        
        if (!post) {
          // Try fetching from Firestore if not in current state
          try {
            const postsRef = collection(db, 'posts');
            const q = query(postsRef, where('slug', '==', slug));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const docData = querySnapshot.docs[0].data();
              post = {
                id: docData.id,
                title: docData.title,
                content: docData.content,
                published: docData.published,
                updated: docData.updated,
                labels: docData.labels || [],
                url: docData.url,
                author: { displayName: 'Editorial Team', id: 'admin', image: { url: '' }, url: '' }
              } as BloggerPost;
            }
          } catch (error) {
            console.error('Error fetching post by slug:', error);
          }
        }

        if (post) {
          setSelectedPost(post);
          setSelectedCategory(null);
          setSelectedPage(null);
          if (isPathChanged && navigationType !== 'POP') window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (path.startsWith('/category/')) {
        const category = decodeURIComponent(path.replace('/category/', ''));
        setSelectedCategory(category);
        setSelectedPost(null);
        setSelectedPage(null);
        if (isPathChanged) setCurrentPage(1);
        if (isPathChanged && navigationType !== 'POP') window.scrollTo(0, 0);
      } else if (path.startsWith('/page/')) {
        const slug = path.replace('/page/', '');
        let page = pages.find(p => bloggerService.slugify(p.title) === slug);

        if (!page) {
          // Try fetching from Firestore if not in current state
          try {
            const pagesRef = collection(db, 'pages');
            const q = query(pagesRef, where('slug', '==', slug));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const docData = querySnapshot.docs[0].data();
              page = {
                id: docData.id,
                title: docData.title,
                content: docData.content,
                published: docData.published,
                url: docData.url
              } as BloggerPage;
            }
          } catch (error) {
            console.error('Error fetching page by slug:', error);
          }
        }

        if (page) {
          setSelectedPage(page);
          setSelectedPost(null);
          setSelectedCategory(null);
          if (isPathChanged && navigationType !== 'POP') window.scrollTo(0, 0);
        }
      }
    };

    handleDeepLink();
  }, [location.pathname, posts, pages, navigationType]);

  // Background Auto-Sync
  useEffect(() => {
    const autoSync = async () => {
      // Check if we synced recently (e.g., in the last 30 mins) to avoid excessive API hits
      const lastSync = localStorage.getItem('habitxpress_last_sync');
      const now = Date.now();
      if (lastSync && now - parseInt(lastSync) < 1800000) return;

      try {
        await fetch('/api/sync');
        localStorage.setItem('habitxpress_last_sync', now.toString());
        console.log('Background sync completed successfully.');
      } catch (error) {
        console.error('Background sync failed:', error);
      }
    };
    
    autoSync();
  }, []);

  // Test Connection
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();
  }, []);

  // Track Post Engagement
  useEffect(() => {
    if (!selectedPost) {
      setPostEngagement(null);
      return;
    }

    const postId = selectedPost.id;
    const engagementRef = doc(db, 'post_engagement', postId);

    // Initial View Increment
    const incrementView = async () => {
      try {
        const docSnap = await getDoc(engagementRef);
        if (docSnap.exists()) {
          await updateDoc(engagementRef, {
            views: increment(1),
            lastUpdated: serverTimestamp()
          });
        } else {
          await setDoc(engagementRef, {
            postId,
            views: 1,
            likes: 0,
            lastUpdated: serverTimestamp()
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `post_engagement/${postId}`);
      }
    };

    incrementView();

    // Listen for real-time updates
    const unsubscribe = onSnapshot(engagementRef, (doc) => {
      if (doc.exists()) {
        setPostEngagement(doc.data() as { views: number, likes: number });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `post_engagement/${postId}`);
    });

    return () => unsubscribe();
  }, [selectedPost]);

  const handleLike = async () => {
    if (!selectedPost) return;
    const postId = selectedPost.id;
    const engagementRef = doc(db, 'post_engagement', postId);

    try {
      await updateDoc(engagementRef, {
        likes: increment(1),
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `post_engagement/${postId}`);
    }
  };

  const fetchLabelCounts = useCallback(async (labels: string[]) => {
    // Process in small batches to avoid rate limits
    const batchSize = 3;
    
    for (let i = 0; i < labels.length; i += batchSize) {
      const batch = labels.slice(i, i + batchSize);
      const batchCounts: Record<string, number> = {};
      
      await Promise.all(batch.map(async (label) => {
        try {
          // Fetch with maxResults=500 to get a good count even if totalItems is missing
          // We use maxResults=500 because it's the maximum allowed and gives us the count via items.length
          const response = await bloggerService.getPosts(500, undefined, label);
          
          let count = 0;
          if (response.totalItems !== undefined) {
            count = parseInt(response.totalItems.toString());
          } else if (response.items) {
            count = response.items.length;
          }
          
          // If count is still 0, try Firestore as a last resort
          if (count === 0) {
            const postsRef = collection(db, 'posts');
            const q = query(postsRef, where('labels', 'array-contains', label));
            const snapshot = await getCountFromServer(q);
            count = snapshot.data().count;
          }
          
          batchCounts[label] = count;
          console.log(`Count for ${label}: ${count}`);
        } catch (error) {
          console.error(`Error fetching count for ${label}:`, error);
        }
      }));
      
      // Update state incrementally using functional update to avoid stale closures
      setLabelCounts(prev => {
        const next = { ...prev, ...batchCounts };
        localStorage.setItem('habitxpress_label_counts_cache', JSON.stringify(next));
        return next;
      });
    }
  }, []);

  const fetchPosts = useCallback(async (token?: any, category?: string | null, pageNum = 1, isLoadMore = false) => {
    // Only show loader if we have absolutely no data to show
    if (posts.length === 0) {
      setLoading(true);
    }
    
    if (pageNum === 1) {
      setNextPageToken(undefined);
    }
    
    if (isLoadMore) {
      setIsFetchingMore(true);
    }
    
    let dataFetched = false;
    let firestoreCount = 0;

    // 1. TRY FIRESTORE FIRST (Fast Path)
    try {
      console.log('Attempting Firestore fetch (Fast Path)...');
      const postsRef = collection(db, 'posts');
      let q;
      let countQuery;
      
      if (category) {
        q = query(
          postsRef, 
          where('labels', 'array-contains', category),
          orderBy('published', 'desc')
        );
        countQuery = query(postsRef, where('labels', 'array-contains', category));
      } else {
        q = query(
          postsRef, 
          orderBy('published', 'desc')
        );
        countQuery = query(postsRef);
      }

      // Always fetch total count for accurate pagination
      try {
        const countSnapshot = await getCountFromServer(countQuery);
        firestoreCount = countSnapshot.data().count;
        
        // Use Firestore count as a baseline
        setTotalPosts(prev => Math.max(prev, firestoreCount));
        console.log(`Firestore total count: ${firestoreCount}`);
      } catch (countError) {
        console.error('Error fetching count from Firestore:', countError);
      }

      // Firestore pagination: 
      // If we have a token (snapshot), use startAfter
      // If we don't have a token but pageNum > 1, we fetch up to that page and slice
      let firestoreQuery;
      const fsLimit = category ? 500 : 20;
      if (token && typeof token !== 'string') {
        firestoreQuery = query(q, startAfter(token), limit(fsLimit));
      } else {
        // Smart Jump: Fetch up to the required page and slice
        // This ensures we can jump even without tokens
        firestoreQuery = query(q, limit(pageNum * fsLimit));
      }

      const querySnapshot = await getDocs(firestoreQuery);
      let firestorePosts = querySnapshot.docs.map(doc => doc.data() as BloggerPost);
      
      // If we fetched multiple pages worth of data, slice to get the current page
      if (!token && pageNum > 1) {
        firestorePosts = firestorePosts.slice((pageNum - 1) * fsLimit);
      }

      if (firestorePosts.length > 0) {
        if (isLoadMore) {
          setPosts(prev => [...prev, ...firestorePosts]);
        } else {
          setPosts(firestorePosts);
        }
        dataFetched = true;
        setLoading(false);
        console.log('Firestore fetch successful.');
      }
    } catch (fsError) {
      console.error('Firestore problem detected, falling back to Blogger API:', fsError);
    }

    // 2. ALWAYS TRY BLOGGER API ON PAGE 1 OR IF FIRESTORE IS INCOMPLETE
    // This ensures we have the latest posts and the correct totalItems count from CMS
    const shouldFetchBlogger = !dataFetched || pageNum === 1 || (pageNum > 1 && !token) || (totalPosts > firestoreCount);

    if (shouldFetchBlogger) {
      try {
        console.log('Fetching from Blogger API (Source of Truth)...');
        // Use 40 for categories to support infinite scroll efficiently
        const limit = category ? 40 : 20;
        const bloggerResponse = await bloggerService.getPosts(limit, token, category || undefined);
        const bloggerItems = bloggerResponse.items || [];
        
        if (bloggerItems.length > 0) {
          // ALWAYS update posts if we are in a category view or if Blogger has more items
          // This fixes the issue where only 20 articles were shown even if 152 existed
          if (isLoadMore) {
            setPosts(prev => {
              // Filter out duplicates just in case
              const existingIds = new Set(prev.map(p => p.id));
              const newItems = bloggerItems.filter(p => !existingIds.has(p.id));
              return [...prev, ...newItems];
            });
          } else if (category || bloggerItems.length > posts.length || pageNum > 1) {
            setPosts(bloggerItems);
          } else if (pageNum === 1 && dataFetched) {
            const firstBloggerId = bloggerItems[0]?.id;
            const firstFirestoreId = posts[0]?.id;
            if (firstBloggerId !== firstFirestoreId) {
              setPosts(bloggerItems);
            }
          }
          
          dataFetched = true;

          // Cache for "zero second" loading
          if (!token && !category && pageNum === 1) {
            localStorage.setItem('habitxpress_posts_cache', JSON.stringify(bloggerItems));
          }
          
          // Update total posts from Blogger (Source of Truth)
          let bloggerTotal = 0;
          if (bloggerResponse.totalItems) {
            bloggerTotal = parseInt(bloggerResponse.totalItems.toString());
          } else if (category && labelCounts[category]) {
            // Use our pre-calculated label counts if available
            bloggerTotal = labelCounts[category];
          } else if (bloggerItems.length < limit) {
            bloggerTotal = (pageNum - 1) * limit + bloggerItems.length;
          } else {
            // If we don't have totalItems and we got a full page, 
            // we know there's at least this many
            bloggerTotal = Math.max(totalPosts, bloggerItems.length);
          }

          if (bloggerTotal > 0) {
            setTotalPosts(bloggerTotal);
            
            // Also update labelCounts for the selected category
            if (category) {
              setLabelCounts(prev => {
                const next = { ...prev, [category]: bloggerTotal };
                localStorage.setItem('habitxpress_label_counts_cache', JSON.stringify(next));
                return next;
              });
            }
          } else if (totalPosts === 0 || totalPosts < bloggerItems.length) {
            const currentLimit = category ? 40 : 20;
            if (bloggerResponse.nextPageToken) {
              setTotalPosts(pageNum * currentLimit + 1); 
            } else {
              setTotalPosts((pageNum - 1) * currentLimit + bloggerItems.length);
            }
          }

          // Update token history
          if (bloggerResponse.nextPageToken) {
            setNextPageToken(bloggerResponse.nextPageToken);
            setPageTokens(prev => {
              const next = [...prev];
              next[pageNum] = bloggerResponse.nextPageToken;
              return next;
            });
          } else {
            setNextPageToken(undefined);
          }

          // Sync to Firestore in background
          fetch('/api/sync').catch(() => {});
        }
      } catch (bloggerError) {
        console.error('Blogger API also failed:', bloggerError);
      }
    }

    setLoading(false);
    setIsFetchingMore(false);
  }, [selectedCategory, dynamicLabels, totalPosts, posts.length]);

  const fetchPages = useCallback(async () => {
    try {
      const response = await bloggerService.getPages();
      const newPages = response.items || [];
      setPages(newPages);
      localStorage.setItem('habitxpress_pages_cache', JSON.stringify(newPages));
    } catch (error) {
      console.error('Error fetching pages:', error);
    }
  }, []);

  const fetchLabels = useCallback(async () => {
    try {
      // 1. Try Firestore first for fast category discovery
      console.log('Attempting to discover categories from Firestore...');
      const postsRef = collection(db, 'posts');
      const q = query(postsRef, limit(500));
      const querySnapshot = await getDocs(q);
      const firestorePosts = querySnapshot.docs.map(doc => doc.data() as BloggerPost);
      
      const fsLabels = firestorePosts.reduce((acc: string[], post) => {
        if (post.labels) {
          post.labels.forEach(label => {
            const trimmedLabel = label.trim();
            if (trimmedLabel && !acc.includes(trimmedLabel)) acc.push(trimmedLabel);
          });
        }
        return acc;
      }, []);

      if (fsLabels.length > 0) {
        const sortedLabels = [...new Set(fsLabels)].sort((a, b) => a.localeCompare(b));
        setDynamicLabels(sortedLabels);
        localStorage.setItem('habitxpress_labels_cache', JSON.stringify(sortedLabels));
        fetchLabelCounts(sortedLabels);
        console.log(`Discovered ${sortedLabels.length} categories from Firestore.`);
      }

      // 2. Always try Blogger API in background to ensure 'unlimited' categories are found
      console.log('Discovering all categories from Blogger API (Source of Truth)...');
      const response = await bloggerService.getPosts(500);
      const allPosts = response.items || [];
      
      const discoveredLabels = allPosts.reduce((acc: string[], post) => {
        if (post.labels) {
          post.labels.forEach(label => {
            const trimmedLabel = label.trim();
            if (trimmedLabel && !acc.includes(trimmedLabel)) acc.push(trimmedLabel);
          });
        }
        return acc;
      }, []);
      
      if (discoveredLabels.length > 0) {
        const sortedLabels = [...new Set(discoveredLabels)].sort((a, b) => a.localeCompare(b));
        setDynamicLabels(prev => {
          if (JSON.stringify(sortedLabels) !== JSON.stringify(prev)) {
            localStorage.setItem('habitxpress_labels_cache', JSON.stringify(sortedLabels));
          }
          // Always fetch counts for discovered labels to ensure they are up to date
          fetchLabelCounts(sortedLabels);
          return sortedLabels;
        });
      }
    } catch (error) {
      console.error('Error discovering labels:', error);
    }
  }, []);

  // Combined initialization for maximum speed
  useEffect(() => {
    const initApp = async () => {
      // Run post fetching, page fetching, and label discovery in parallel
      await Promise.all([
        fetchPosts(undefined, selectedCategory, 1),
        fetchPages(),
        fetchLabels()
      ]);
      
      // If we have cached labels, fetch their counts immediately
      if (dynamicLabels.length > 0) {
        fetchLabelCounts(dynamicLabels);
      }
    };
    
    initApp();
  }, [selectedCategory]); // Refetch when category changes

  const handleCategoryClick = (category: string) => {
    navigate(`/category/${encodeURIComponent(category)}`);
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handlePostClick = (post: BloggerPost) => {
    navigate(`/post/${bloggerService.slugify(post.title)}`);
  };

  const handlePageClick = (page: BloggerPage) => {
    navigate(`/page/${bloggerService.slugify(page.title)}`);
  };

  const handleSync = async () => {
    try {
      await fetch('/api/sync');
      // Refresh posts and labels after sync
      await Promise.all([
        fetchPosts(undefined, selectedCategory, 1),
        fetchLabels()
      ]);
      localStorage.setItem('habitxpress_last_sync', Date.now().toString());
    } catch (error) {
      console.error("Manual sync failed:", error);
    }
  };

  const handleRefresh = () => {
    localStorage.removeItem('habitxpress_posts_cache');
    localStorage.removeItem('habitxpress_labels_cache');
    localStorage.removeItem('habitxpress_label_counts_cache');
    localStorage.removeItem('habitxpress_pages_cache');
    window.location.reload();
  };

  // Manual Load More
  const handleLoadMore = () => {
    if (!nextPageToken || loading || isFetchingMore) return;
    fetchPosts(nextPageToken, selectedCategory, currentPage + 1, true);
    setCurrentPage(prev => prev + 1);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setSubscribeMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setIsSubscribing(true);
    setSubscribeMessage(null);

    try {
      // Save to Firestore using email as document ID for easy existence check
      const subscriberDocRef = doc(db, 'subscribers', trimmedEmail);
      
      let snapshot;
      try {
        // Use getDocFromServer to bypass cache and be sure
        snapshot = await getDocFromServer(subscriberDocRef);
      } catch (getError) {
        console.error('Error checking subscription (from server):', getError);
        // Fallback to regular getDoc if fromServer fails
        try {
          snapshot = await getDoc(subscriberDocRef);
        } catch (getDocError) {
          console.error('Error checking subscription (regular):', getDocError);
          handleFirestoreError(getDocError, OperationType.GET, `subscribers/${trimmedEmail}`);
        }
      }
      
      if (!snapshot?.exists()) {
        try {
          await setDoc(subscriberDocRef, {
            email: trimmedEmail,
            subscribedAt: new Date().toISOString(),
            source: 'newsletter_form'
          });
        } catch (setError) {
          console.error('Error creating subscription:', setError);
          handleFirestoreError(setError, OperationType.WRITE, `subscribers/${trimmedEmail}`);
        }

        // Call backend to send email via Resend
        try {
          await fetch('/api/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: trimmedEmail }),
          });
        } catch (emailError) {
          console.error('Error sending welcome email:', emailError);
        }
        setSubscribeMessage({ type: 'success', text: 'Success! You are now part of the HabitXpress community.' });
      } else {
        setSubscribeMessage({ type: 'error', text: 'This email is already subscribed! Stay tuned.' });
      }
      
      setEmail('');
    } catch (error) {
      console.error('Error in handleSubscribe:', error);
      let errorMessage = 'Something went wrong. Please try again later.';
      
      // Try to parse JSON error from handleFirestoreError
      try {
        if (error instanceof Error && error.message.startsWith('{')) {
          const errData = JSON.parse(error.message);
          errorMessage = `Firestore Error: ${errData.error}`;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
      } catch (e) {
        // Fallback to default
      }
      
      setSubscribeMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      // If empty, reset to random 5
      const shuffled = [...posts].sort(() => 0.5 - Math.random());
      setRandomSearchPosts(shuffled.slice(0, 5));
      return;
    }
    
    setIsSearching(true);
    try {
      // Search in Firestore for better results
      const postsRef = collection(db, 'posts');
      // Note: Firestore doesn't support full-text search directly without external services
      // but we can do a simple prefix search or just filter the local posts more thoroughly
      // For now, we'll search through ALL posts we have in state, but we'll also try to fetch more from Firestore
      
      const results = posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.labels && post.labels.some(l => l.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setRandomSearchPosts(results.slice(0, 10)); // Show up to 10 results
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRandomSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      const shuffled = [...posts].sort(() => 0.5 - Math.random());
      setRandomSearchPosts(shuffled.slice(0, 5));
      setIsSearching(false);
    }, 600);
  };

  useEffect(() => {
    if (posts.length > 0 && randomSearchPosts.length === 0) {
      const shuffled = [...posts].sort(() => 0.5 - Math.random());
      setRandomSearchPosts(shuffled.slice(0, 5));
    }
  }, [posts, randomSearchPosts.length]);

  const getRandomPosts = (count: number) => {
    if (!posts.length) return [];
    // Filter out the current post to avoid showing it in the "News" section
    const otherPosts = posts.filter(p => p.id !== selectedPost?.id);
    const shuffled = [...otherPosts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const handleNextArticle = () => {
    if (!selectedPost) return;
    const currentIndex = posts.findIndex(p => p.id === selectedPost.id);
    if (currentIndex < posts.length - 1) {
      setSelectedPost(posts[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevArticle = () => {
    if (!selectedPost) return;
    const currentIndex = posts.findIndex(p => p.id === selectedPost.id);
    if (currentIndex > 0) {
      setSelectedPost(posts[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    const limit = selectedCategory ? 500 : 20;
    const totalPages = Math.max(currentPage + (nextPageToken ? 1 : 0), Math.ceil(totalPosts / limit));
    if (currentPage < totalPages) {
      const nextNum = currentPage + 1;
      const nextToken = pageTokens[nextNum - 1];
      fetchPosts(nextToken, selectedCategory, nextNum);
      setCurrentPage(nextNum);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevNum = currentPage - 1;
      const prevToken = pageTokens[prevNum - 1];
      fetchPosts(prevToken, selectedCategory, prevNum);
      setCurrentPage(prevNum);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpPage);
    const limit = selectedCategory ? 500 : 20;
    const totalPages = Math.max(currentPage + (nextPageToken ? 1 : 0), Math.ceil(totalPosts / limit));
    if (!isNaN(pageNum) && pageNum > 0 && pageNum <= totalPages) {
      // If we have the token for this page, use it
      if (pageTokens[pageNum - 1] !== undefined || pageNum === 1) {
        fetchPosts(pageTokens[pageNum - 1], selectedCategory, pageNum);
        setCurrentPage(pageNum);
      } else {
        // If we don't have the token, we can only go to page 1 or the furthest known page
        // For simplicity, we'll just go to page 1
        fetchPosts(undefined, selectedCategory, 1);
        setCurrentPage(1);
      }
      setJumpPage('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGenerate = async (topic?: string) => {
    setIsGenerating(true);
    setAiInsight(null);
    const targetTopic = topic || AI_TOPICS[Math.floor(Math.random() * AI_TOPICS.length)].title;
    setSelectedAiTopic(targetTopic);
    
    try {
      const insight = await geminiService.generateInsight(targetTopic);
      setAiInsight(insight);
    } catch (error) {
      console.error("Error generating insight:", error);
      setAiInsight("Failed to generate insight. Please check your API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white selection:bg-red-100 selection:text-red-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleHomeClick}>
            <h1 className="text-xl font-black tracking-tighter flex items-center">
              HABIT<span className="text-red-600">X</span>PRESS
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleSync}
              className="p-2 text-slate-700 hover:text-red-600 transition-colors"
              title="Sync from Blogger"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button 
              onClick={handleRefresh}
              className="p-2 text-slate-700 hover:text-red-600 transition-colors"
              title="Refresh Content"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-6 py-2 rounded-sm transition-colors uppercase tracking-wider"
            >
              Subscribe
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Admin Dashboard */}
        {showAdmin && isAdmin && <AdminDashboard />}

        {/* Hero Section - Only on Home */}
        {!selectedCategory && !selectedPost && !selectedPage && !showAdmin && (
          <>
            <section className="relative pt-20 pb-32 overflow-hidden">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50 -skew-x-12 translate-x-1/4 -z-10" />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="inline-block bg-red-600 text-white text-[10px] font-bold px-4 py-1 uppercase tracking-[0.2em] mb-8">
                    The Habit Revolution
                  </span>
                  <h2 className="text-5xl md:text-7xl font-black leading-[1.1] mb-8 max-w-4xl mx-auto">
                    Master Your <span className="text-red-600">Habits</span>,<br />
                    Master Your Life
                  </h2>
                  <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
                    HabitXpress delivers science-backed strategies to help you build unbreakable routines and achieve peak performance.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <button 
                      onClick={() => {
                        const element = document.getElementById('latest-news');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-10 py-4 rounded-sm shadow-xl shadow-red-600/20 transition-all hover:-translate-y-1 uppercase tracking-wider text-sm"
                    >
                      Start Your Journey
                    </button>
                    
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xs">
                        HX
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Editorial Team</p>
                        <p className="text-xs text-slate-600 font-medium">Daily Insights</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>

          </>
        )}

        {/* AI News Section - Only on Home */}
        {!selectedCategory && !selectedPost && !selectedPage && (
          <section className="bg-black text-white py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid lg:grid-cols-2 gap-16 items-start">
                <div>
                  <span className="text-red-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
                    <Zap className="w-3 h-3 fill-current" /> Powered by HabitXpress AI
                  </span>
                  <h2 className="text-4xl md:text-5xl font-black mb-6">
                    HABITXPRESS <span className="text-red-600">AI NEWS</span>
                  </h2>
                  <p className="text-white mb-12 max-w-lg">
                    Get instant, AI-generated insights on the latest trending habit science and personal optimization news. Unlimited, free, and always fresh.
                  </p>

                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-white uppercase tracking-widest mb-4">Recommended AI Topics</p>
                    {AI_TOPICS.map((topic) => (
                      <button 
                        key={topic.id}
                        onClick={() => handleGenerate(topic.title)}
                        className={`w-full flex items-center justify-between p-4 border transition-all group ${selectedAiTopic === topic.title ? 'bg-red-600/10 border-red-600' : 'bg-slate-900/50 border-slate-800 hover:border-red-600/50 hover:bg-slate-800'}`}
                      >
                        <div className="flex items-center gap-4">
                          <topic.icon className={`w-5 h-5 transition-colors ${selectedAiTopic === topic.title ? 'text-red-600' : 'text-slate-500 group-hover:text-red-600'}`} />
                          <span className="text-xs font-bold tracking-wider text-white">{topic.title}</span>
                        </div>
                        <ArrowRight className={`w-4 h-4 transition-colors ${selectedAiTopic === topic.title ? 'text-red-600' : 'text-slate-600 group-hover:text-white'}`} />
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleGenerate()}
                    className="w-full mt-8 flex items-center justify-center gap-2 py-4 bg-red-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    Random AI Insight
                  </button>
                </div>

                <div className="relative aspect-square lg:aspect-auto lg:h-full min-h-[500px] bg-gradient-to-br from-slate-900 to-black border border-slate-800 flex flex-col items-center justify-center text-center p-12">
                  <AnimatePresence mode="wait">
                    {isGenerating ? (
                      <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center"
                      >
                        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-6" />
                        <p className="text-xl font-bold text-white">Generating Insight...</p>
                      </motion.div>
                    ) : aiInsight ? (
                      <motion.div 
                        key="insight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-start text-left w-full h-full overflow-y-auto custom-scrollbar"
                      >
                        <div className="flex items-center gap-2 mb-6 text-red-600">
                          <Zap className="w-5 h-5 fill-current" />
                          <span className="text-[10px] font-black uppercase tracking-widest">HabitXpress AI News Report</span>
                        </div>
                        <div className="prose prose-invert max-w-none">
                          <div className="text-white text-base leading-relaxed whitespace-pre-wrap font-medium">
                            {aiInsight}
                          </div>
                        </div>
                        <button 
                          onClick={() => setAiInsight(null)}
                          className="mt-8 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                        >
                          ← Clear Result
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="ready"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center"
                      >
                        <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-8">
                          <Sparkles className="w-10 h-10 text-slate-500" />
                        </div>
                        <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter text-white">HABITXPRESS <span className="text-red-600">NEWS FEED</span></h3>
                        <p className="text-white text-sm max-w-xs">
                          Select a topic or click "Random AI Insight" to get a 500-word trending news report powered by Groq AI.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Browse Topics */}
        {!selectedPost && !selectedPage && (
          <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-black uppercase tracking-tighter">Browse Topics</h2>
                <div className="bg-red-600 text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-full">
                  {dynamicLabels.length} Categories Found
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {(dynamicLabels.length > 0 ? dynamicLabels : BROWSE_TOPICS.map(t => t.title)).map((label, i) => (
                  <div 
                    key={i} 
                    onClick={() => handleCategoryClick(label)}
                    className={`bg-white p-8 border border-slate-200 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden ${selectedCategory === label ? 'ring-2 ring-red-600' : ''}`}
                  >
                    <div className="absolute top-0 right-0 p-4">
                      <span className="text-[10px] font-black text-slate-600 group-hover:text-red-600/40 transition-colors">
                        {labelCounts[label] !== undefined ? `${labelCounts[label]} Articles` : 'Counting...'}
                      </span>
                    </div>
                    <span className="text-4xl font-black text-red-600 mb-6 block">#</span>
                    <h3 className="text-xs font-black tracking-widest leading-relaxed group-hover:text-red-600 transition-colors uppercase">
                      {label}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Page Detail View */}
        {selectedPage && (
          <section className="py-24 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <button 
                onClick={() => setSelectedPage(null)}
                className="flex items-center gap-2 text-slate-900 hover:text-red-600 font-bold text-xs uppercase tracking-widest mb-12 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Home
              </button>

              <div className="mb-12">
                <h1 className="text-4xl md:text-6xl font-black mb-8 leading-tight uppercase tracking-tighter">
                  {selectedPage.title}
                </h1>
                <div className="w-20 h-1 bg-red-600 mb-12" />
              </div>

              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedPage.content }}
              />
            </div>
          </section>
        )}

        {/* Post Detail View */}
        <AnimatePresence mode="wait">
          {selectedPost && (
            <motion.section 
              key={selectedPost.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="py-24 bg-white"
            >
              <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <button 
                onClick={() => {
                  if (window.history.length > 2) {
                    navigate(-1);
                  } else {
                    if (selectedPost?.labels && selectedPost.labels.length > 0) {
                      navigate(`/category/${encodeURIComponent(selectedPost.labels[0])}`);
                    } else {
                      navigate('/');
                    }
                  }
                }}
                className="flex items-center gap-2 text-slate-800 hover:text-red-600 font-bold text-xs uppercase tracking-widest mb-12 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Feed
              </button>

              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[10px] font-black bg-red-600 text-white px-3 py-1 uppercase tracking-widest">
                    {selectedPost.labels?.[0] || 'Article'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                    {new Date(selectedPost.published).toLocaleDateString()}
                  </span>
                  {postEngagement && (
                    <div className="flex items-center gap-4 ml-auto">
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1">
                        <Users className="w-3 h-3" /> {postEngagement.views} Views
                      </span>
                      <button 
                        onClick={handleLike}
                        className="text-[10px] font-bold text-red-600 uppercase tracking-widest flex items-center gap-1 hover:scale-110 transition-transform"
                      >
                        <Trophy className="w-3 h-3" /> {postEngagement.likes} Likes
                      </button>
                    </div>
                  )}
                </div>
                <h1 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
                  {selectedPost.title}
                </h1>

                {/* Social Sharing Buttons */}
                <div className="flex flex-wrap items-center gap-3 mb-10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2 flex items-center gap-1">
                    <Share2 className="w-3 h-3" /> Share:
                  </span>
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    <Facebook className="w-3 h-3" /> Facebook
                  </a>
                  <a 
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(selectedPost.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#1DA1F2] hover:bg-[#1a91da] text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    <Twitter className="w-3 h-3" /> Twitter
                  </a>
                  <a 
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#0A66C2] hover:bg-[#0958a8] text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    <Linkedin className="w-3 h-3" /> LinkedIn
                  </a>
                  <a 
                    href={`mailto:?subject=${encodeURIComponent(selectedPost.title)}&body=${encodeURIComponent(`Check out this article on HabitXpress: ${window.location.href}`)}`}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    <Mail className="w-3 h-3" /> Email
                  </a>
                </div>

                <div className="flex items-center gap-4 mb-12 pb-12 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500">
                    {selectedPost.author.displayName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest">{selectedPost.author.displayName}</p>
                    <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">Editorial Team</p>
                  </div>
                </div>
              </div>

              <div className="aspect-video mb-12 overflow-hidden rounded-sm border border-slate-100 bg-slate-50">
                <motion.img 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  src={bloggerService.getOptimizedImageUrl(bloggerService.extractThumbnail(selectedPost.content), 's1600')} 
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>

              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: bloggerService.sanitizeContent(selectedPost.content) }}
              />

              {/* Article Navigation */}
              <div className="mt-24 pt-12 border-t border-slate-100 flex items-center justify-between">
                <button 
                  onClick={handlePrevArticle}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white transition-all">
                    <ChevronLeft className="w-5 h-5" />
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Previous Article</p>
                    <p className="text-xs font-black uppercase tracking-tight group-hover:text-red-600 transition-colors">Older Insight</p>
                  </div>
                </button>

                <button 
                  onClick={handleNextArticle}
                  className="flex items-center gap-4 group text-right"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Next Article</p>
                    <p className="text-xs font-black uppercase tracking-tight group-hover:text-red-600 transition-colors">Newer Insight</p>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>
              </div>

              {/* HabitXpress News Section */}
              <div className="mt-32">
                <div className="flex items-center justify-between mb-12 border-b border-slate-100 pb-6">
                  <h2 className="text-2xl font-black uppercase tracking-tight">
                    HABITXPRESS <span className="text-red-600">NEWS</span>
                  </h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {getRandomPosts(6).map((post) => (
                    <article 
                      key={post.id} 
                      className="group cursor-pointer"
                      onClick={() => handlePostClick(post)}
                      onMouseEnter={() => {
                        const img = new Image();
                        img.src = bloggerService.getOptimizedImageUrl(bloggerService.extractThumbnail(post.content), 's1600');
                      }}
                    >
                      <div className="aspect-video overflow-hidden mb-4 bg-slate-100 rounded-sm border border-slate-100">
                        <motion.img 
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          src={bloggerService.getOptimizedImageUrl(bloggerService.extractThumbnail(post.content), 'w400-h225-c')} 
                          alt={post.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                      </div>
                      <h3 className="text-sm font-black mb-2 group-hover:text-red-600 transition-colors line-clamp-2 uppercase tracking-tight">
                        {post.title}
                      </h3>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

        {/* Latest News / Blog Feed */}
        {!selectedPost && !selectedPage && !showAdmin && (
          <section id="latest-news" className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between mb-12 border-b border-slate-100 pb-6">
                <h2 className="text-3xl font-black uppercase">
                  {selectedCategory ? selectedCategory : 'LATEST NEWS'}
                </h2>
              </div>
              
              {loading ? (
                <div className={`grid gap-12 ${selectedCategory ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-video bg-slate-100 mb-6 rounded-sm" />
                      <div className="h-6 bg-slate-100 w-3/4 mb-4 rounded-sm" />
                      <div className="h-4 bg-slate-100 w-full mb-2 rounded-sm" />
                      <div className="h-4 bg-slate-100 w-1/2 rounded-sm" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={selectedCategory || 'home'}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className={`grid gap-12 ${selectedCategory ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}
                    >
                    {posts.length > 0 ? (
                      (selectedCategory ? posts : posts.slice(0, 20)).map((post, index) => (
                        <motion.article 
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index % 12 * 0.05 }}
                          key={post.id} 
                          className="group cursor-pointer"
                          onClick={() => handlePostClick(post)}
                          onMouseEnter={() => {
                            const img = new Image();
                            img.src = bloggerService.getOptimizedImageUrl(bloggerService.extractThumbnail(post.content), 's1600');
                          }}
                        >
                          <div className="aspect-video overflow-hidden mb-6 bg-slate-100 relative rounded-sm border border-slate-100">
                            <motion.img 
                              initial={{ opacity: 0 }}
                              whileInView={{ opacity: 1 }}
                              viewport={{ once: true }}
                              src={bloggerService.getOptimizedImageUrl(bloggerService.extractThumbnail(post.content), 'w800-h450-c')} 
                              alt={post.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              referrerPolicy="no-referrer"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                          </div>
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-[9px] font-black bg-red-600 text-white px-2 py-0.5 uppercase tracking-widest">
                              {selectedCategory || (post.labels && post.labels[0]) || 'Article'}
                            </span>
                          </div>
                          <h3 className="text-xl font-black mb-4 group-hover:text-red-600 transition-colors leading-tight line-clamp-2">
                            {post.title}
                          </h3>
                          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-700">
                                {post.author.displayName.charAt(0)}
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-800">
                                {post.author.displayName}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                              {new Date(post.published).toLocaleDateString()}
                            </span>
                          </div>
                        </motion.article>
                      ))
                    ) : (
                      <div className="col-span-full py-32 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                          <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">
                          No articles found
                        </h3>
                        <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                          We couldn't find any articles in the "{selectedCategory || ''}" category. Try browsing our latest news instead.
                        </p>
                        <button 
                          onClick={handleHomeClick}
                          className="bg-red-600 text-white font-bold px-8 py-3 rounded-full text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all"
                        >
                          View All Articles
                        </button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
                {/* Manual Load More - Only on Categories */}
                  {selectedCategory && (
                    <div className="py-24 flex flex-col items-center justify-center border-t border-slate-100 mt-12">
                      {isFetchingMore ? (
                        <div className="flex flex-col items-center gap-6 w-full max-w-md">
                          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden relative">
                            <motion.div 
                              initial={{ left: '-100%' }}
                              animate={{ left: '100%' }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                              className="absolute top-0 bottom-0 w-1/2 bg-red-600"
                            />
                          </div>
                          <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] animate-pulse">Synchronizing Latest Insights...</p>
                        </div>
                      ) : nextPageToken ? (
                        <div className="flex flex-col items-center gap-6 w-full max-w-md">
                          <p className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">
                            Showing {posts.length} of {totalPosts} Articles
                          </p>
                          <button 
                            onClick={handleLoadMore}
                            className="w-full bg-red-600 text-white font-black px-12 py-6 rounded-sm text-sm uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-xl hover:shadow-red-500/20 active:scale-[0.98] flex items-center justify-center gap-4 group"
                          >
                            Load More Articles
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            >
                              <RefreshCw className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </motion.div>
                          </button>
                        </div>
                      ) : (
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">You've reached the end of our articles.</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        )}

        {/* Why Choose Us - Only on Home */}
        {!selectedCategory && !selectedPost && !selectedPage && !showAdmin && (
          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="max-w-3xl mb-16">
                <h2 className="text-5xl font-black mb-8 leading-tight">
                  WHY CHOOSE <br />
                  <span className="text-red-600">HABITXPRESS?</span>
                </h2>
                <p className="text-slate-800 text-lg leading-relaxed">
                  We are more than just a blog. We are your partner in personal evolution, providing the blueprint for a better you.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                {FEATURES.map((feature, i) => (
                  <div key={i} className="relative group">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-black mb-4">{feature.title}</h3>
                    <p className="text-slate-800 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* The Science of Habit Building - Only on Home */}
        {!selectedCategory && !selectedPost && !selectedPage && (
          <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
              <h2 className="text-4xl md:text-5xl font-black mb-8">
                THE SCIENCE OF <span className="text-red-600">HABIT BUILDING</span>
              </h2>
              <p className="text-slate-800 max-w-2xl mx-auto mb-16 leading-relaxed">
                Understanding the "Habit Loop" is the first step toward lasting change. Here is how your brain processes every routine you build.
              </p>
 
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {HABIT_LOOP.map((step, i) => (
                  <div key={i} className="bg-white p-10 border border-slate-200 text-left relative overflow-hidden group">
                    <span className="absolute top-4 right-6 text-6xl font-black text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                      {step.number}
                    </span>
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-8 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      <step.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-black mb-4">{step.title}</h3>
                    <p className="text-slate-700 text-xs leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* HabitXpress Service Tool */}
        {!selectedCategory && !selectedPost && !selectedPage && !showAdmin && (
          <HabitXpressTool />
        )}

        {/* Habit Science Facts - New Section */}
        {!selectedCategory && !selectedPost && !selectedPage && (
          <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="relative">
                  <div className="absolute -top-12 -left-12 w-48 h-48 bg-red-600/5 rounded-full blur-3xl" />
                  <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-red-600/5 rounded-full blur-3xl" />
                  <h2 className="text-5xl font-black mb-8 leading-tight relative z-10">
                    DID YOU <span className="text-red-600">KNOW?</span><br />
                    <span className="text-slate-500">HABIT SCIENCE FACTS</span>
                  </h2>
                  <p className="text-slate-800 text-lg leading-relaxed mb-12 relative z-10">
                    The latest breakthroughs in neurobiology reveal that our brains are more adaptable than we ever imagined. Here are some mind-blowing facts about how habits work.
                  </p>
                  
                  <div className="space-y-8 relative z-10">
                    {[
                      { title: "The 66-Day Rule", text: "Contrary to the 21-day myth, research from UCL shows it takes an average of 66 days for a new behavior to become automatic." },
                      { title: "Neuroplasticity", text: "Repeating a habit physically strengthens the neural pathways in your brain, making the action easier over time." },
                      { title: "Keystone Habits", text: "Success in one area (like exercise) often triggers a 'ripple effect' that makes other positive habits easier to adopt." }
                    ].map((fact, i) => (
                      <div key={i} className="flex gap-6 items-start">
                        <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-1">
                          0{i+1}
                        </div>
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-tight mb-1">{fact.title}</h4>
                          <p className="text-slate-700 text-xs leading-relaxed">{fact.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="relative">
                  <div className="aspect-square bg-slate-50 rounded-sm border border-slate-100 p-12 flex flex-col items-center justify-center text-center group">
                    <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-red-600/20">
                      <Brain className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Your Brain on Habits</h3>
                    <p className="text-slate-700 text-sm leading-relaxed max-w-sm">
                      When a habit is formed, the brain's basal ganglia takes over, allowing the prefrontal cortex (the decision-making part) to go into "power-save" mode.
                    </p>
                    <div className="mt-12 pt-12 border-t border-slate-200 w-full">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Habit Strength</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-600">92% Automatic</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: '92%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-red-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA Banner - Only on Home */}
        {!selectedCategory && !selectedPost && !selectedPage && (
          <section className="bg-black text-white py-24 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-900/20 to-transparent" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
                    READY TO ARCHITECT YOUR LIFE?
                  </h2>
                  <p className="text-white mb-10 leading-relaxed max-w-lg">
                    Our expert-curated guides break down complex behavioral science into simple, actionable steps you can start today.
                  </p>
                  <button className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-sm text-xs uppercase tracking-widest transition-all">
                    Explore All Guides
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-slate-900/50 border border-slate-800 p-12 text-center">
                    <p className="text-5xl font-black text-red-600 mb-4">21</p>
                    <p className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Days to Build</p>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800 p-12 text-center">
                    <p className="text-5xl font-black text-red-600 mb-4">1%</p>
                    <p className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Better Every Day</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* More Than Just A Blog - Only on Home */}
        {!selectedCategory && !selectedPost && !selectedPage && (
          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
              <h2 className="text-4xl md:text-6xl font-black mb-8">
                MORE THAN JUST A <span className="red-underline">BLOG</span>.
              </h2>
              <p className="text-slate-600 max-w-3xl mx-auto mb-20 leading-relaxed">
                HabitXpress is a movement. We combine cognitive behavioral science with practical, real-world experience to help you architect a life that feels effortless.
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-32">
                {[
                  { title: 'HABIT OF THE WEEK', desc: 'The 2-Minute Rule: How to stop procrastinating by starting small.', icon: Lightbulb, color: 'bg-yellow-50 text-yellow-600' },
                  { title: 'COMMUNITY CHALLENGE', desc: "Join 12,000 others in our '30 Days of Mindfulness' journey.", icon: Users, color: 'bg-blue-50 text-blue-600' },
                  { title: 'SUCCESS STORY', desc: 'How James built a morning routine that saved his business.', icon: Trophy, color: 'bg-green-50 text-green-600' },
                  { title: 'EXPERT INSIGHT', desc: 'Neuroscience explains why your brain resists new routines.', icon: Brain, color: 'bg-purple-50 text-purple-600' },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-full ${item.color} flex items-center justify-center mb-6`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xs font-black mb-4">{item.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed max-w-[200px]">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Framework Box */}
              <div className="max-w-4xl mx-auto bg-white border-[3px] border-black rounded-[40px] p-12 text-left shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)]">
                <h2 className="text-3xl font-black mb-12 uppercase tracking-tight">The HabitXpress Framework</h2>
                <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
                  {FRAMEWORK.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                        {step.number}
                      </div>
                      <div>
                        <h3 className="text-sm font-black mb-3">{step.title}</h3>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Quote Section - Only on Home */}
        {!selectedCategory && !selectedPost && !selectedPage && (
          <section className="bg-gradient-to-r from-red-600 to-red-800 py-32 text-center text-white px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-black italic mb-12 leading-tight max-w-5xl mx-auto">
                "Small habits, compounded daily, create extraordinary lives."
              </h2>
              <button className="border-2 border-white text-white font-bold px-10 py-4 rounded-full text-xs uppercase tracking-widest hover:bg-white hover:text-red-600 transition-all">
                Join Our Community
              </button>
            </motion.div>
          </section>
        )}

        {/* Newsletter */}
        <section id="newsletter" className="py-32 bg-slate-50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-20" />
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <div className="bg-white p-12 md:p-20 rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/50">
              <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                Join 50,000+ Habit Builders
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                Get Weekly Habit Tips — <span className="text-red-600">Free.</span>
              </h2>
              <p className="text-slate-600 mb-12 leading-relaxed text-lg max-w-2xl mx-auto">
                Science-backed strategies for a better life, delivered to your inbox every Sunday morning. No fluff, just results.
              </p>
              
              <form className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-8" onSubmit={handleSubscribe}>
                <div className="flex-1 relative">
                  <input 
                    type="email" 
                    placeholder="your@email.com" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-full px-8 py-5 text-sm focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all placeholder:text-slate-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubscribing}
                    required
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSubscribing}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-10 py-5 rounded-full text-xs uppercase tracking-widest transition-all shadow-xl shadow-red-600/30 disabled:opacity-50 flex items-center justify-center gap-2 group"
                >
                  {isSubscribing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Subscribe Now
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
              
              {subscribeMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-2xl text-sm font-bold ${
                    subscribeMessage.type === 'success' 
                      ? 'bg-green-50 text-green-700 border border-green-100' 
                      : 'bg-red-50 text-red-700 border border-red-100'
                  }`}
                >
                  {subscribeMessage.text}
                </motion.div>
              )}

              <div className="mt-12 pt-12 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div>
                  <div className="text-2xl font-black text-slate-900 mb-1">100%</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Free Forever</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 mb-1">5 Min</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Weekly Read</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 mb-1">Zero</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Spam Policy</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - 3 Columns Fixed */}
      <footer className="bg-white border-t border-slate-100 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 mb-24">
            {/* Col 1: Brand & Social */}
            <div className="flex flex-col items-start">
              <h2 className="text-2xl font-black tracking-tighter mb-6 cursor-pointer flex items-center text-black" onClick={handleHomeClick}>
                HABIT<span className="text-red-600">X</span>PRESS
              </h2>
              <p className="text-black font-bold text-sm leading-relaxed mb-8 max-w-xs">
                The world's leading resource for habit formation, behavioral science, and personal optimization. Science-backed insights for a better life.
              </p>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/share/1CdTRZGHDB/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-black hover:text-red-600 hover:border-red-600 hover:bg-red-50 transition-all shadow-sm">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://www.instagram.com/unlock_you_daily__thoughts?igsh=MXM2Y3oyZ3ZwNjN6Nw==" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-black hover:text-red-600 hover:border-red-600 hover:bg-red-50 transition-all shadow-sm">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://youtube.com/@habitxpress?si=Lx2wkVtGkzh7g0xi" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-black hover:text-red-600 hover:border-red-600 hover:bg-red-50 transition-all shadow-sm">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>            {/* Col 2: Categories */}
            <div className="md:pl-8">
              <h3 className="text-[10px] font-black text-black mb-8 border-b border-slate-100 pb-2 uppercase tracking-widest">Categories</h3>
              <ul className="grid grid-cols-1 gap-4">
                {(dynamicLabels.length > 0 ? dynamicLabels : BROWSE_TOPICS.map(t => t.title)).map((label, i) => (
                  <li key={i}>
                    <button 
                      onClick={() => handleCategoryClick(label)}
                      className="text-black text-xs font-black hover:text-red-600 transition-colors uppercase tracking-wider text-left flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-black group-hover:bg-red-600 transition-colors" />
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Legal Pages from Blogger */}
            <div className="md:pl-8">
              <h3 className="text-[10px] font-black text-black mb-8 border-b border-slate-100 pb-2 uppercase tracking-widest">Legal Information</h3>
              <ul className="space-y-4">
                {pages.length > 0 ? (
                  pages.map((page) => (
                    <li key={page.id} className="flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-black group-hover:bg-red-600 transition-colors" />
                      <button 
                        onClick={() => handlePageClick(page)}
                        className="text-black text-xs font-black hover:text-red-600 transition-colors uppercase tracking-wider text-left"
                      >
                        {page.title}
                      </button>
                    </li>
                  ))
                ) : (
                  ['Cookie Policy', 'Contact Us', 'Disclaimer', 'About Us', 'Term of Service', 'Privacy Policy'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-black group-hover:bg-red-600 transition-colors" />
                      <button className="text-black text-xs font-black hover:text-red-600 transition-colors uppercase tracking-wider text-left">
                        {item}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center pt-12 border-t border-slate-100 gap-10">
            <div className="flex gap-8">
              <a href="https://www.facebook.com/share/1CdTRZGHDB/" target="_blank" rel="noopener noreferrer" className="text-black hover:text-red-600 transition-all transform hover:scale-110">
                <Facebook className="w-8 h-8" />
              </a>
              <a href="https://www.instagram.com/unlock_you_daily__thoughts?igsh=MXM2Y3oyZ3ZwNjN6Nw==" target="_blank" rel="noopener noreferrer" className="text-black hover:text-red-600 transition-all transform hover:scale-110">
                <Instagram className="w-8 h-8" />
              </a>
              <a href="https://youtube.com/@habitxpress?si=Lx2wkVtGkzh7g0xi" target="_blank" rel="noopener noreferrer" className="text-black hover:text-red-600 transition-all transform hover:scale-110">
                <Youtube className="w-8 h-8" />
              </a>
            </div>
            
            <p className="text-xs font-black text-black uppercase tracking-widest">
              © 2026 HABITXPRESS. ALL RIGHTS RESERVED.
            </p>
            {user ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <button 
                    onClick={() => setShowAdmin(!showAdmin)}
                    className="text-[10px] font-black bg-red-600 text-white px-3 py-1 uppercase tracking-widest hover:bg-red-700 transition-colors"
                  >
                    {showAdmin ? 'Back to Website' : 'Admin Dashboard'}
                  </button>
                )}
                <button 
                  onClick={handleLogout}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-widest"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-widest"
              >
                Admin Login
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
    </ErrorBoundary>
  );
}
