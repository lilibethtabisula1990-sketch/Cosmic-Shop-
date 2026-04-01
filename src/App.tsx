import React, { useState, useEffect, useRef, Component } from 'react';
import { 
  ShoppingBag, 
  MessageSquare, 
  PlusCircle, 
  FileText, 
  User, 
  Upload, 
  X, 
  Trash2, 
  LogOut, 
  LogIn, 
  ShieldCheck,
  Tag,
  PhilippinePeso,
  Image as ImageIcon,
  Camera,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Download,
  Package,
  ArrowLeft,
  Send,
  Menu,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Github,
  Bell,
  BellDot,
  Shield,
  Lock,
  EyeOff,
  Zap,
  Globe,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  User as SupabaseUser 
} from '@supabase/supabase-js';
import { supabase } from './supabase';
import { cn } from './lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

type PostType = 'file' | 'account';

interface Post {
  id: string;
  type: PostType;
  title: string;
  description: string;
  price: number;
  images: string[];
  files?: string[];
  stock?: number;
  likes?: number;
  account_info?: {
    username?: string;
    password?: string;
  };
  author_id: string;
  created_at: string;
}

interface Feedback {
  id: string;
  content: string;
  author_name: string;
  image_url?: string;
  created_at: string;
}

interface Seller {
  id: string;
  email: string;
  uid: string;
  added_at: string;
}

interface TopUpRequest {
  id: string;
  uid: string;
  email: string;
  amount: number;
  proof_image?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface Purchase {
  id: string;
  uid: string;
  post_id: string;
  amount: number;
  created_at: string;
}

interface Message {
  id: string;
  purchase_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface GlobalMessage {
  id: string;
  user_id: string;
  username: string;
  content: string;
  created_at: string;
}

interface Notification {
  id: string;
  uid: string;
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

// --- Components ---

const Button = ({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  children, 
  icon: Icon,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'purple' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  icon?: React.ElementType;
}) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
    secondary: 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-600',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    purple: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/20',
    glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'p-2',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : Icon ? (
        <Icon className={cn("h-4 w-4", children ? "mr-2" : "")} />
      ) : null}
      {children}
    </button>
  );
};

const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      'flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all hover:bg-white/10',
      className
    )}
    {...props}
  />
);

const Textarea = ({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={cn(
      'flex min-h-[100px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all hover:bg-white/10',
      className
    )}
    {...props}
  />
);

const Card = ({ className, children, glass, ...props }: { className?: string; children: React.ReactNode; glass?: boolean; [key: string]: any }) => (
  <div 
    className={cn(
      'rounded-2xl border overflow-hidden transition-all',
      glass 
        ? 'bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl' 
        : 'border-gray-200 bg-white shadow-sm',
      className
    )} 
    {...props}
  >
    {children}
  </div>
);

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode; 
  footer?: React.ReactNode;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#1a1a2e] border border-white/10 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/5 p-6">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-white/5 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 text-gray-300">
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-white/5 bg-white/5 p-6">
            {footer}
          </div>
        )}
      </motion.div>
    </div>
  );
};

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends Component<{ children?: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children?: React.ReactNode }) {
    super(props);
    (this as any).state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    const { hasError, error } = (this as any).state;
    if (hasError) {
      let errorMessage = "Something went wrong.";
      errorMessage = error.message || String(error);

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a1a] p-4 text-center">
          <div className="mb-4 rounded-full bg-red-500/20 p-4 text-red-500 shadow-lg shadow-red-500/20">
            <AlertCircle className="h-12 w-12" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white tracking-tight">Application Error</h1>
          <p className="mb-8 max-w-md text-gray-400 leading-relaxed">{errorMessage}</p>
          <Button variant="purple" size="lg" onClick={() => window.location.reload()}>
            Reload Application
          </Button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

// --- Main App ---

export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

const ImageGallery = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-white/10">
        <ImageIcon className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full group/gallery">
      <img 
        src={images[currentIndex]} 
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
        alt="" 
        referrerPolicy="no-referrer"
      />
      {images.length > 1 && (
        <>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(i);
                }}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === currentIndex ? "w-4 bg-purple-500" : "w-1.5 bg-white/30 hover:bg-white/50"
                )}
              />
            ))}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover/gallery:opacity-100 transition-opacity hover:bg-black/70"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover/gallery:opacity-100 transition-opacity hover:bg-black/70"
          >
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </button>
        </>
      )}
    </div>
  );
};

function App() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isSeller, setIsSeller] = useState(false);

  // Auth Form State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authRepeatPassword, setAuthRepeatPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Configuration Check
  if (!supabase) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a1a] p-4 text-center">
        <div className="mb-4 rounded-full bg-amber-500/20 p-4 text-amber-500 shadow-lg shadow-amber-500/20">
          <AlertCircle className="h-12 w-12" />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-white tracking-tight">Configuration Required</h1>
        <p className="mb-8 max-w-md text-gray-400 leading-relaxed">
          Supabase environment variables are missing. Please add <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong> to the AI Studio Secrets panel.
        </p>
        <div className="rounded-2xl bg-white/5 p-6 border border-white/10 text-left max-w-lg">
          <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">How to fix:</h2>
          <ol className="list-decimal list-inside text-sm text-gray-400 space-y-3">
            <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" className="text-purple-400 hover:underline">Supabase Dashboard</a>.</li>
            <li>Select your project and go to <strong>Project Settings &gt; API</strong>.</li>
            <li>Copy the <strong>Project URL</strong> and <strong>anon public key</strong>.</li>
            <li>In AI Studio, click the <strong>Settings</strong> (gear icon) and add them as secrets.</li>
            <li>Reload this page.</li>
          </ol>
        </div>
      </div>
    );
  }

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
    type: 'alert' | 'confirm';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert'
  });

  const showAlert = (title: string, message: string) => {
    setModalConfig({ isOpen: true, title, message, type: 'alert' });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setModalConfig({ isOpen: true, title, message, onConfirm, type: 'confirm' });
  };
  const [activeTab, setActiveTab] = useState<'shop' | 'feedback' | 'admin' | 'whitelist' | 'topup' | 'requests' | 'chat' | 'orders' | 'inbox' | 'global_chat'>('shop');
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [topups, setTopups] = useState<TopUpRequest[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [globalMessages, setGlobalMessages] = useState<GlobalMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activePurchase, setActivePurchase] = useState<Purchase | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newGlobalMessage, setNewGlobalMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  const [securityCooldown, setSecurityCooldown] = useState<number>(0);
  const [honeypot, setHoneypot] = useState(''); // Layer 4: Honeypot for bot detection

  // Layer 1: Action Throttling & Cooldown Timer
  useEffect(() => {
    if (securityCooldown > 0) {
      const timer = setInterval(() => setSecurityCooldown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [securityCooldown]);

  const checkSecurity = () => {
    if (honeypot) {
      console.warn("Bot detected via honeypot.");
      return false;
    }
    if (securityCooldown > 0) {
      showAlert('Security Cooldown', `Please wait ${securityCooldown}s before performing another action.`);
      return false;
    }
    return true;
  };

  const setCooldown = (seconds: number = 5) => {
    setSecurityCooldown(seconds);
  };

  // Derived seller status to ensure real-time updates
  useEffect(() => {
    if (user && sellers.length > 0) {
      const seller = sellers.find(s => s.id === user.id);
      setIsSeller(!!seller);
    } else if (!user) {
      setIsSeller(false);
    }
  }, [user, sellers]);

  // Whitelist Form State
  const [whitelistEmail, setWhitelistEmail] = useState('');
  const [whitelistUid, setWhitelistUid] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isWhitelisting, setIsWhitelisting] = useState(false);
  const [whitelistUsername, setWhitelistUsername] = useState('');
  const [isSearchingUser, setIsSearchingUser] = useState(false);

  // TopUp Form State
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpProof, setTopUpProof] = useState<string | null>(null);
  const [isRequestingTopUp, setIsRequestingTopUp] = useState(false);
  const [processingTopUpId, setProcessingTopUpId] = useState<string | null>(null);

  // Admin Form State
  const [postType, setPostType] = useState<PostType>('file');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [stock, setStock] = useState('999');
  const [images, setImages] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Feedback Form State
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackImage, setFeedbackImage] = useState<string | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const ADMIN_EMAILS = [
    'lilibethtabisula1990@gmail.com',
    'cosmicadmin123@cosmicshop.com'
  ];

  const handleSupabaseError = (error: any, operation: string) => {
    // Log detailed error for developers, but obfuscate for users (Layer 7)
    console.error(`[Security Log] Error during ${operation}:`, error);
    
    const message = error.message || '';
    const code = error.code || '';

    if (message.includes('Could not find the table') || code === 'PGRST116' || code === '42P01') {
      showAlert('System Maintenance', `The database table for "${operation}" is missing. Please ensure your Supabase database is properly set up.`);
    } else if ((message.includes('column') && message.includes('does not exist')) || code === '42703' || code === 'PGRST204') {
      showAlert('Database Update Required', `A required column for "${operation}" is missing (e.g., likes, stock, files). Please run the SQL fix in your Supabase dashboard.`);
    } else if (code === '42501') {
      showAlert('Access Denied', 'You do not have permission to perform this action. Check your Supabase RLS policies.');
    } else if (message.includes('JWT') || message.includes('Invalid API key') || code === 'PGRST301' || code === '401') {
      showAlert('Authentication Error', 'There is a problem with the database authentication. Please check your Supabase API keys in the Secrets panel.');
    } else if (message.includes('fetch') || message.includes('NetworkError') || message.includes('Failed to fetch') || code === 'TypeError') {
      showAlert('Connection Error', 'Could not connect to the database. Please check your internet connection and the Supabase URL.');
    } else {
      const codeSuffix = code ? ` (Code: ${code})` : '';
      showAlert('Request Failed', `Your request could not be processed at this time. Please try again later.${codeSuffix}`);
    }
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      showAlert('Configuration Missing', 'Supabase URL and Anon Key are missing. Please configure them in the AI Studio Secrets panel to enable database features.');
      return;
    }

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsSuperAdmin(!!session?.user?.email && ADMIN_EMAILS.includes(session.user.email));
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      clearTimeout(timeout);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsSuperAdmin(!!currentUser?.email && ADMIN_EMAILS.includes(currentUser.email));
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  // User Profile & Seller Status Initialization
  useEffect(() => {
    if (!user) {
      setIsSeller(false);
      setUserBalance(0);
      return;
    }

    const initUser = async () => {
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (userError && userError.code === 'PGRST116') {
          // User doesn't exist, create profile
          const role = (user.email && ADMIN_EMAILS.includes(user.email)) ? 'admin' : 'user';
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email,
              display_name: user.user_metadata?.full_name || user.email,
              balance: 0,
              role: role
            });
          
          if (insertError) console.error("Error creating user profile:", insertError);
          setUserBalance(0);
          setIsSuperAdmin(role === 'admin');
        } else if (userData) {
          setUserBalance(userData.balance || 0);
          if (userData.role === 'admin') {
            setIsSuperAdmin(true);
          }
        }
      } catch (e) {
        console.error("Error checking/creating user profile:", e);
      }
    };

    initUser();
  }, [user]);

  // Real-time balance listener
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user-balance-${user.id}-${Math.random().toString(36).substring(7)}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          setUserBalance(payload.new.balance || 0);
          if (payload.new.role === 'admin') {
            setIsSuperAdmin(true);
          } else if (payload.new.role === 'user' && !ADMIN_EMAILS.includes(user.email || '')) {
            setIsSuperAdmin(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    // Initial fetch
    const fetchPublicData = async () => {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (postsError) handleSupabaseError(postsError, 'list posts');
      else setPosts(postsData || []);

      const { data: feedbacksData, error: feedbacksError } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false });
      if (feedbacksError) handleSupabaseError(feedbacksError, 'list feedbacks');
      else setFeedbacks(feedbacksData || []);

      const { data: sellersData, error: sellersError } = await supabase
        .from('sellers')
        .select('*');
      if (sellersError) handleSupabaseError(sellersError, 'list sellers');
      else setSellers(sellersData || []);

      const { data: globalMsgsData } = await supabase
        .from('global_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);
      if (globalMsgsData) setGlobalMessages(globalMsgsData);
    };

    fetchPublicData();

    // Real-time subscriptions
    const postsChannel = supabase.channel(`public-posts-${Math.random().toString(36).substring(7)}`).on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
      supabase.from('posts').select('*').order('created_at', { ascending: false }).then(({ data }) => setPosts(data || []));
    }).subscribe();

    const feedbacksChannel = supabase.channel(`public-feedbacks-${Math.random().toString(36).substring(7)}`).on('postgres_changes', { event: '*', schema: 'public', table: 'feedbacks' }, () => {
      supabase.from('feedbacks').select('*').order('created_at', { ascending: false }).then(({ data }) => setFeedbacks(data || []));
    }).subscribe();

    const sellersChannel = supabase.channel(`public-sellers-${Math.random().toString(36).substring(7)}`).on('postgres_changes', { event: '*', schema: 'public', table: 'sellers' }, () => {
      supabase.from('sellers').select('*').then(({ data }) => setSellers(data || []));
    }).subscribe();

    const globalChatChannel = supabase.channel(`public-global-chat-${Math.random().toString(36).substring(7)}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'global_messages' }, (payload) => {
      setGlobalMessages(prev => [...prev, payload.new].slice(-50));
    }).subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(feedbacksChannel);
      supabase.removeChannel(sellersChannel);
      supabase.removeChannel(globalChatChannel);
    };
  }, []);

  // User-specific data fetch
  useEffect(() => {
    if (!user) {
      setTopups([]);
      setPurchases([]);
      return;
    }

    const fetchUserData = async () => {
      // Fetch Topups (if admin)
      if (isSuperAdmin) {
        const { data: topupData } = await supabase.from('topups').select('*').order('created_at', { ascending: false });
        if (topupData) setTopups(topupData);
      }

      // Fetch User's Purchases
      const { data: purchaseData } = await supabase
        .from('purchases')
        .select('*')
        .eq('uid', user.id)
        .order('created_at', { ascending: false });
      if (purchaseData) setPurchases(purchaseData);

      // Fetch User's Notifications
      const { data: notificationData } = await supabase
        .from('notifications')
        .select('*')
        .eq('uid', user.id)
        .order('created_at', { ascending: false });
      if (notificationData) setNotifications(notificationData);
    };

    fetchUserData();

    // Real-time subscriptions for user data
    const topupsChannel = supabase.channel(`user-topups-${user.id}-${Math.random().toString(36).substring(7)}`).on('postgres_changes', { event: '*', schema: 'public', table: 'topups' }, () => {
      if (isSuperAdmin) {
        supabase.from('topups').select('*').order('created_at', { ascending: false }).then(({ data }) => setTopups(data || []));
      }
    }).subscribe();

    const purchasesChannel = supabase.channel(`user-purchases-${user.id}-${Math.random().toString(36).substring(7)}`).on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'purchases',
      filter: `uid=eq.${user.id}`
    }, () => {
      supabase.from('purchases').select('*').eq('uid', user.id).order('created_at', { ascending: false }).then(({ data }) => setPurchases(data || []));
    }).subscribe();

    const notificationsChannel = supabase.channel(`user-notifications-${user.id}-${Math.random().toString(36).substring(7)}`).on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'notifications',
      filter: `uid=eq.${user.id}`
    }, () => {
      supabase.from('notifications').select('*').eq('uid', user.id).order('created_at', { ascending: false }).then(({ data }) => setNotifications(data || []));
    }).subscribe();

    return () => {
      supabase.removeChannel(topupsChannel);
      supabase.removeChannel(purchasesChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [user, isSuperAdmin]);

  // Protected listeners
  useEffect(() => {
    if (!user || !activePurchase) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('purchase_id', activePurchase.id)
        .order('created_at', { ascending: true });
      
      if (error) console.error("Error fetching messages:", error);
      else setMessages(data || []);
    };

    fetchMessages();

    const channel = supabase
      .channel(`chat-${activePurchase.id}-${Math.random().toString(36).substring(7)}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `purchase_id=eq.${activePurchase.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activePurchase]);

  useEffect(() => {
    if (!user) {
      setTopups([]);
      return;
    }

    const fetchTopups = async () => {
      let query = supabase.from('topups').select('*').order('created_at', { ascending: false });
      if (!isSuperAdmin) {
        query = query.eq('uid', user.id);
      }
      const { data, error } = await query;
      if (error) handleSupabaseError(error, 'list topups');
      else setTopups(data || []);
    };

    fetchTopups();

    const topupsChannel = supabase.channel('user-topups').on('postgres_changes', { event: '*', schema: 'public', table: 'topups' }, () => {
      fetchTopups();
    }).subscribe();

    return () => {
      supabase.removeChannel(topupsChannel);
    };
  }, [user, isSuperAdmin]);

  // Purchases listener
  useEffect(() => {
    if (!user) {
      setPurchases([]);
      return;
    }

    const fetchPurchases = async () => {
      let query = supabase.from('purchases').select('*').order('created_at', { ascending: false });
      if (!isSuperAdmin) {
        query = query.eq('uid', user.id);
      }
      const { data, error } = await query;
      if (error) handleSupabaseError(error, 'list purchases');
      else setPurchases(data || []);
    };

    fetchPurchases();

    const purchasesChannel = supabase.channel('user-purchases').on('postgres_changes', { event: '*', schema: 'public', table: 'purchases' }, () => {
      fetchPurchases();
    }).subscribe();

    return () => {
      supabase.removeChannel(purchasesChannel);
    };
  }, [user, isSuperAdmin]);

  const handleLogin = async () => {
    if (!authUsername || !authPassword) {
      showAlert('Error', 'Please enter both username and password.');
      return;
    }
    setIsAuthenticating(true);
    try {
      const email = `${authUsername.toLowerCase()}@cosmicshop.com`;
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: authPassword,
      });
      if (error) throw error;
      setShowAuthModal(false);
      setAuthUsername('');
      setAuthPassword('');
    } catch (error: any) {
      console.error('Login failed:', error);
      showAlert('Login Failed', error.message || 'Invalid username or password.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignUp = async () => {
    if (!authUsername || !authPassword || !authRepeatPassword) {
      showAlert('Error', 'Please fill in all fields.');
      return;
    }
    if (authPassword !== authRepeatPassword) {
      showAlert('Error', 'Passwords do not match.');
      return;
    }
    setIsAuthenticating(true);
    try {
      const email = `${authUsername.toLowerCase()}@cosmicshop.com`;
      const { error } = await supabase.auth.signUp({
        email,
        password: authPassword,
        options: {
          data: {
            full_name: authUsername,
          }
        }
      });
      if (error) throw error;
      showAlert('Success', 'Account created! You can now login.');
      setAuthMode('login');
      setAuthPassword('');
      setAuthRepeatPassword('');
    } catch (error: any) {
      console.error('Sign up failed:', error);
      showAlert('Sign Up Failed', error.message || 'Could not create account.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'images' | 'files' | 'feedback' | 'topup') => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'images') {
          setImages(prev => [...prev, base64].slice(0, 20));
        } else if (type === 'files') {
          setFiles(prev => [...prev, base64]);
        } else if (type === 'feedback') {
          setFeedbackImage(base64);
        } else if (type === 'topup') {
          setTopUpProof(base64);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePost = async () => {
    console.log('handlePost called', { user: user?.email, isSuperAdmin, isSeller });
    if (!user) {
      handleLogin();
      return;
    }
    if (!isSuperAdmin && !isSeller) {
      showAlert('Unauthorized', 'Only admins and whitelisted sellers can create posts.');
      return;
    }
    if (!checkSecurity()) return; // Layer 1 & 4 check

    // Layer 2: Strict Character Limits & Sanitization
    const cleanTitle = title.trim();
    const cleanDesc = description.trim();

    if (!cleanTitle || !cleanDesc) {
      showAlert('Missing Information', 'Please fill in both title and description before posting.');
      return;
    }

    if (cleanTitle.length > 100 || cleanDesc.length > 2000) {
      showAlert('Security Limit', 'Title or description is too long. Please shorten them.');
      return;
    }

    // Layer 3: Image Size Validation (Max 2MB per image)
    const oversizedImage = images.find(img => img.length > 2 * 1024 * 1024);
    if (oversizedImage) {
      showAlert('Security Limit', 'One or more images exceed the 2MB size limit.');
      return;
    }

    setIsPosting(true);
    try {
      const postData: any = {
        type: postType,
        title: cleanTitle,
        description: cleanDesc,
        price: Math.min(parseFloat(price) || 0, 1000000), // Layer 6: Price cap
        stock: parseInt(stock) || 0,
        likes: 0,
        images,
        author_id: user.id,
        created_at: new Date().toISOString(),
      };

      if (postType === 'file') {
        postData.files = files;
      } else {
        postData.account_info = { 
          username: username.trim().substring(0, 100), 
          password: password.trim().substring(0, 100) 
        };
      }

      const { error } = await supabase.from('posts').insert(postData);
      if (error) throw error;
      
      setCooldown(10); // Layer 5: 10s cooldown after posting
      // Reset form
      setTitle('');
      setDescription('');
      setPrice('0');
      setStock('999');
      setImages([]);
      setFiles([]);
      setUsername('');
      setPassword('');
      setActiveTab('shop');
    } catch (error) {
      handleSupabaseError(error, 'create post');
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!isSuperAdmin && !isSeller) return;
    showConfirm('Delete Post', 'Are you sure you want to delete this post?', async () => {
      try {
        const { error } = await supabase.from('posts').delete().eq('id', id);
        if (error) throw error;
        showAlert('Deleted', 'The post has been successfully deleted.');
      } catch (error) {
        handleSupabaseError(error, 'delete post');
      }
    });
  };

  const handleLikePost = async (post: Post) => {
    if (!user) {
      handleLogin();
      return;
    }
    try {
      const { error } = await supabase
        .from('posts')
        .update({ likes: (post.likes || 0) + 1 })
        .eq('id', post.id);
      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'like post');
    }
  };

  const handleWhitelist = async () => {
    if (!isSuperAdmin || !whitelistEmail || !whitelistUid) return;
    setIsWhitelisting(true);
    try {
      const { error } = await supabase.from('sellers').upsert({
        id: whitelistUid,
        email: whitelistEmail,
        uid: whitelistUid,
        added_at: new Date().toISOString()
      });
      if (error) throw error;
      setWhitelistEmail('');
      setWhitelistUid('');
      setWhitelistUsername('');
      showAlert('Success', 'Seller added to whitelist.');
    } catch (error) {
      handleSupabaseError(error, 'whitelist seller');
    } finally {
      setIsWhitelisting(false);
    }
  };

  const handleSearchUser = async () => {
    if (!whitelistUsername.trim()) return;
    setIsSearchingUser(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email')
        .eq('display_name', whitelistUsername.trim())
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          showAlert('Not Found', 'User with this username not found.');
        } else {
          throw error;
        }
      } else if (data) {
        setWhitelistEmail(data.email);
        setWhitelistUid(data.id);
        showAlert('User Found', `Found user: ${data.email}. You can now add them to the whitelist.`);
      }
    } catch (error) {
      handleSupabaseError(error, 'search user');
    } finally {
      setIsSearchingUser(false);
    }
  };

  const handleRemoveSeller = async (id: string) => {
    if (!isSuperAdmin) return;
    showConfirm('Remove Seller', 'Remove this seller from whitelist?', async () => {
      try {
        const { error } = await supabase.from('sellers').delete().eq('id', id);
        if (error) throw error;
        showAlert('Removed', 'Seller removed from whitelist.');
      } catch (error) {
        handleSupabaseError(error, 'remove seller');
      }
    });
  };

  const handleTopUpRequest = async () => {
    if (!user || !topUpAmount) return;
    if (!checkSecurity()) return;

    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0 || amount > 1000000) {
      showAlert('Invalid Amount', 'Please enter a valid amount between ₱1 and ₱1,000,000.');
      return;
    }

    setIsRequestingTopUp(true);
    try {
      const { error } = await supabase.from('topups').insert({
        uid: user.id,
        email: user.email,
        amount: amount,
        proof_image: topUpProof,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      if (error) throw error;
      setCooldown(30); // 30s cooldown for top-up requests
      setTopUpAmount('');
      setTopUpProof(null);
      showAlert('Request Sent', 'Your top up request has been sent and is pending approval.');
    } catch (error) {
      handleSupabaseError(error, 'topup request');
    } finally {
      setIsRequestingTopUp(false);
    }
  };

  const handleApproveTopUp = async (request: TopUpRequest) => {
    if (!isSuperAdmin || request.status !== 'pending' || processingTopUpId) return;
    
    setProcessingTopUpId(request.id);
    try {
      // Update user balance (Note: In production, use RPC for atomic increment)
      const { data: userData, error: fetchError } = await supabase.from('users').select('balance').eq('id', request.uid).single();
      if (fetchError) throw fetchError;
      
      const currentBalance = userData?.balance || 0;
      
      const { error: userError } = await supabase
        .from('users')
        .update({ balance: currentBalance + request.amount })
        .eq('id', request.uid);
      
      if (userError) throw userError;
      
      // Update request status
      const { error: requestError } = await supabase
        .from('topups')
        .update({ status: 'approved' })
        .eq('id', request.id);
      
      if (requestError) throw requestError;

      // Create notification for user
      await supabase.from('notifications').insert({
        uid: request.uid,
        title: 'Top Up Approved',
        content: `Your top up request for ₱${request.amount.toLocaleString()} has been approved. Your balance has been updated.`,
        is_read: false,
        created_at: new Date().toISOString()
      });

      showAlert('Success', `Top up of ₱${request.amount} for ${request.email} has been approved.`);
    } catch (error) {
      handleSupabaseError(error, 'approve topup');
    } finally {
      setProcessingTopUpId(null);
    }
  };

  const handleRejectTopUp = async (request: TopUpRequest) => {
    if (!isSuperAdmin) return;
    try {
      const { error } = await supabase.from('topups').update({ status: 'rejected' }).eq('id', request.id);
      if (error) throw error;

      // Create notification for user
      await supabase.from('notifications').insert({
        uid: request.uid,
        title: 'Top Up Rejected',
        content: `Your top up request for ₱${request.amount.toLocaleString()} has been rejected. Please contact support for more details.`,
        is_read: false,
        created_at: new Date().toISOString()
      });

      showAlert('Rejected', 'The top up request has been rejected.');
    } catch (error) {
      handleSupabaseError(error, 'reject topup');
    }
  };

  const handleBuy = async (post: Post) => {
    console.log('handleBuy called', { post: post.title, user: user?.email, userBalance });
    if (!user) {
      handleLogin();
      return;
    }
    if (!checkSecurity()) return;

    if (userBalance < post.price) {
      showAlert('Insufficient Balance', 'Please top up your balance to purchase this item.');
      setActiveTab('topup');
      return;
    }

    if (post.stock != null && post.stock <= 0) {
      showAlert('Out of Stock', 'This item is currently out of stock.');
      return;
    }

    showConfirm('Confirm Purchase', `Are you sure you want to buy "${post.title}" for ₱${post.price.toLocaleString()}?`, async () => {
      try {
        setCooldown(5); // Cooldown during process
        
        // Check stock again before purchase
        const { data: latestPost, error: stockCheckError } = await supabase.from('posts').select('stock').eq('id', post.id).single();
        if (stockCheckError) throw stockCheckError;
        if (latestPost.stock != null && latestPost.stock <= 0) {
          showAlert('Out of Stock', 'This item just went out of stock.');
          return;
        }

        // Update user balance (Note: In production, use RPC for atomic decrement)
        const { error: userError } = await supabase
          .from('users')
          .update({ balance: userBalance - post.price })
          .eq('id', user.id);
        
        if (userError) throw userError;

        // Decrease stock
        if (post.stock != null) {
          await supabase.from('posts').update({ stock: latestPost.stock - 1 }).eq('id', post.id);
        }
        
        // Create purchase record
        const { data: purchaseData, error: purchaseError } = await supabase.from('purchases').insert({
          uid: user.id,
          post_id: post.id,
          amount: post.price,
          created_at: new Date().toISOString()
        }).select().single();

        if (purchaseError) throw purchaseError;

        // Create notification for buyer
        await supabase.from('notifications').insert({
          uid: user.id,
          title: 'Purchase Successful',
          content: `You have successfully purchased "${post.title}" for ₱${post.price.toLocaleString()}. Check "My Orders" for details.`,
          is_read: false,
          created_at: new Date().toISOString()
        });

        // Create notification for seller (if not the same person)
        if (post.author_id !== user.id) {
          await supabase.from('notifications').insert({
            uid: post.author_id,
            title: 'New Sale!',
            content: `Someone has purchased your product "${post.title}" for ₱${post.price.toLocaleString()}. Check "Requests" for details.`,
            is_read: false,
            created_at: new Date().toISOString()
          });
        }

        setActivePurchase(purchaseData);
        setActiveTab('chat');
        showAlert('Success', `Purchase successful! You bought ${post.title}. You are now being directed to the chat.`);
      } catch (error) {
        handleSupabaseError(error, 'purchase');
      }
    });
  };

  const handleFeedbackSubmit = async () => {
    if (!user) {
      handleLogin();
      return;
    }
    if (!feedbackContent) return;
    if (!checkSecurity()) return;

    const cleanContent = feedbackContent.trim();
    if (cleanContent.length > 500) {
      showAlert('Security Limit', 'Feedback is too long. Max 500 characters.');
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      const { error } = await supabase.from('feedbacks').insert({
        content: cleanContent,
        author_name: user.user_metadata?.full_name || user.email || 'Anonymous',
        image_url: feedbackImage,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      setCooldown(15); // 15s cooldown for feedback
      setFeedbackContent('');
      setFeedbackImage(null);
    } catch (error) {
      handleSupabaseError(error, 'submit feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !activePurchase || !newMessage.trim()) return;
    try {
      const { error } = await supabase.from('messages').insert({
        purchase_id: activePurchase.id,
        sender_id: user.id,
        content: newMessage.trim(),
        created_at: new Date().toISOString()
      });
      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSendGlobalMessage = async () => {
    if (!user || !newGlobalMessage.trim()) return;
    if (!checkSecurity()) return;

    const messageData = {
      user_id: user.id,
      username: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
      content: newGlobalMessage.trim().substring(0, 500),
      created_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from('global_messages').insert(messageData);
      if (error) throw error;
      setNewGlobalMessage('');
      setCooldown(3); // 3s cooldown for global chat
    } catch (error) {
      handleSupabaseError(error, 'send global message');
    }
  };

  const handleClearGlobalChat = async () => {
    if (!isSuperAdmin) return;
    showConfirm('Clear Global Chat', 'Are you sure you want to clear all messages in the global chat?', async () => {
      try {
        const { error } = await supabase.from('global_messages').delete().neq('id', '0');
        if (error) throw error;
        setGlobalMessages([]);
        showAlert('Success', 'Global chat cleared.');
      } catch (error) {
        handleSupabaseError(error, 'clear global chat');
      }
    });
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const sidebarNavItems = [
    { icon: ShoppingBag, label: 'Shop', tab: 'shop' },
    { icon: Globe, label: 'Global Chat', tab: 'global_chat' },
    { icon: Package, label: 'My Orders', tab: 'orders' },
    { icon: Bell, label: 'Inbox', tab: 'inbox' },
    { icon: MessageSquare, label: 'Proofs', tab: 'feedback' },
    ...(user ? [
      { icon: PhilippinePeso, label: 'Top Up', tab: 'topup' },
    ] : []),
    ...(isSuperAdmin || isSeller ? [
      { icon: PlusCircle, label: 'Post', tab: 'admin' },
    ] : []),
    ...(isSuperAdmin ? [
      { icon: AlertCircle, label: 'Requests', tab: 'requests' },
      { icon: ShieldCheck, label: 'Whitelist', tab: 'whitelist' },
    ] : []),
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a1a]">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white font-sans selection:bg-purple-500/30">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[70] w-72 bg-[#0d0d1f] border-r border-white/5 shadow-2xl lg:hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <h1 className="text-xl font-black tracking-tighter text-white uppercase">
                    COSMIC
                  </h1>
                </div>
                <Button variant="glass" size="icon" onClick={() => setIsSidebarOpen(false)} className="rounded-xl">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                {sidebarNavItems.map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => {
                      setActiveTab(item.tab as any);
                      setIsSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
                      activeTab === item.tab 
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20" 
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.tab === 'inbox' && notifications.filter(n => !n.is_read).length > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white">
                        {notifications.filter(n => !n.is_read).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6 border-t border-white/5">
                <div className="flex items-center justify-center">
                  <a href="#" className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                    <Facebook className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0a1a]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button 
              variant="glass" 
              size="icon" 
              className="lg:hidden rounded-xl"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-500/20">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white">
              COSMIC <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">SHOP</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            {user && (
              <Button
                variant="glass"
                size="icon"
                className="relative rounded-xl"
                onClick={() => setActiveTab('inbox')}
              >
                {notifications.some(n => !n.is_read) ? (
                  <BellDot className="h-5 w-5 text-purple-400" />
                ) : (
                  <Bell className="h-5 w-5" />
                )}
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white">
                    {notifications.filter(n => !n.is_read).length}
                  </span>
                )}
              </Button>
            )}
            {user && (
              <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 border border-white/10 shadow-inner group transition-all hover:bg-white/10">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-500">
                  <PhilippinePeso className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-none mb-0.5">Balance</span>
                  <span className="text-sm font-black tracking-tight leading-none text-white">{userBalance.toLocaleString()}</span>
                </div>
              </div>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-black text-white leading-tight">{user.user_metadata?.full_name || user.email?.split('@')[0]}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
                    {isSuperAdmin ? 'Super Admin' : isSeller ? 'Seller' : 'Customer'}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-2xl border-2 border-white/10 shadow-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-black uppercase">
                  {(user.user_metadata?.full_name || user.email?.split('@')[0] || '?')[0]}
                </div>
                <Button variant="glass" size="icon" onClick={handleLogout} className="rounded-2xl">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="purple" size="md" onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="px-6 rounded-2xl">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="mb-12 hidden lg:flex justify-center overflow-x-auto pb-4 scrollbar-hide">
          <div className="inline-flex flex-nowrap rounded-2xl bg-white/5 p-1.5 border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setActiveTab('shop')}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-black transition-all uppercase tracking-widest',
                activeTab === 'shop' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <ShoppingBag className="h-4 w-4" />
              Shop
            </button>
            <button
              onClick={() => setActiveTab('global_chat')}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-black transition-all uppercase tracking-widest',
                activeTab === 'global_chat' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Globe className="h-4 w-4" />
              Global Chat
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-black transition-all uppercase tracking-widest',
                activeTab === 'feedback' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <MessageSquare className="h-4 w-4" />
              Proofs
            </button>
            {user && (
              <button
                onClick={() => setActiveTab('orders')}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-black transition-all uppercase tracking-widest',
                  activeTab === 'orders' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Package className="h-4 w-4" />
                My Orders
              </button>
            )}
            {user && (
              <button
                onClick={() => setActiveTab('inbox')}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-black transition-all uppercase tracking-widest relative',
                  activeTab === 'inbox' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Bell className="h-4 w-4" />
                Inbox
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white">
                    {notifications.filter(n => !n.is_read).length}
                  </span>
                )}
              </button>
            )}
            {user && (
              <button
                onClick={() => setActiveTab('topup')}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-black transition-all uppercase tracking-widest',
                  activeTab === 'topup' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <PhilippinePeso className="h-4 w-4" />
                Top Up
              </button>
            )}
            {(isSuperAdmin || isSeller) && (
              <button
                onClick={() => setActiveTab('admin')}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-black transition-all uppercase tracking-widest',
                  activeTab === 'admin' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <PlusCircle className="h-4 w-4" />
                Post
              </button>
            )}
            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab('requests')}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-black transition-all uppercase tracking-widest',
                  activeTab === 'requests' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <AlertCircle className="h-4 w-4" />
                Requests
              </button>
            )}
            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab('whitelist')}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-black transition-all uppercase tracking-widest',
                  activeTab === 'whitelist' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <ShieldCheck className="h-4 w-4" />
                Whitelist
              </button>
            )}
            
            {/* Security Status Badge (Layer 7 Visual) */}
            <div className="mt-8 pt-6 border-t border-white/5">
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="relative">
                  <Shield className="h-5 w-5 text-emerald-400" />
                  <Zap className="absolute -top-1 -right-1 h-2.5 w-2.5 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">7-Layer Active</p>
                  <p className="text-[8px] font-bold text-emerald-400/60 uppercase tracking-widest">Anti-DDoS Protected</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'global_chat' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">
                    GLOBAL <span className="text-purple-500">CHAT</span>
                  </h2>
                  <p className="text-gray-400 font-medium tracking-widest uppercase text-xs mt-1">Connect with the community</p>
                </div>
                {isSuperAdmin && (
                  <Button 
                    variant="glass" 
                    size="sm" 
                    onClick={handleClearGlobalChat}
                    className="rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/20 border-red-500/20"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Chat
                  </Button>
                )}
              </div>

              <div className="bg-[#0d0d1f] border border-white/5 rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-2xl">
                <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                  {globalMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                      <Globe className="h-12 w-12 opacity-20" />
                      <p className="font-black uppercase tracking-widest text-sm">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    globalMessages.map((msg, idx) => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={msg.id || idx}
                        className={cn(
                          "flex flex-col max-w-[80%]",
                          msg.user_id === user?.id ? "ml-auto items-end" : "items-start"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-tighter text-purple-400">
                            {msg.username}
                          </span>
                          <span className="text-[8px] text-gray-500 font-medium uppercase tracking-widest">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className={cn(
                          "px-4 py-3 rounded-2xl text-sm font-medium shadow-lg",
                          msg.user_id === user?.id 
                            ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-none" 
                            : "bg-white/5 text-gray-200 border border-white/5 rounded-tl-none"
                        )}>
                          {msg.content}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                <div className="p-4 bg-black/20 border-t border-white/5">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newGlobalMessage}
                      onChange={(e) => setNewGlobalMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendGlobalMessage()}
                      placeholder="Type your message..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-600 font-medium"
                    />
                    <Button 
                      onClick={handleSendGlobalMessage}
                      disabled={!newGlobalMessage.trim()}
                      className="rounded-2xl px-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/20"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'shop' && (
            <motion.div
              key="shop"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {posts.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                  <ShoppingBag className="mb-4 h-12 w-12 opacity-20" />
                  <p>No items for sale yet.</p>
                </div>
              ) : (
                posts.map((post) => {
                  const isPurchased = purchases.some(p => p.post_id === post.id);
                  return (
                    <Card key={post.id} glass className="group relative flex flex-col border-white/5 hover:border-purple-500/50 hover:shadow-purple-500/10">
                      <div className="aspect-video w-full overflow-hidden bg-white/5">
                        <ImageGallery images={post.images} />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className={cn(
                            "inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest backdrop-blur-md border",
                            post.type === 'file' ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          )}>
                            {post.type}
                          </span>
                          {post.stock != null && (
                            <span className={cn(
                              "inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest backdrop-blur-md border",
                              post.stock > 0 ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"
                            )}>
                              {post.stock > 0 ? `Stock: ${post.stock}` : 'Out of Stock'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-xl font-black text-white tracking-tight group-hover:text-purple-400 transition-colors">{post.title}</h3>
                          <span className="text-xl font-black text-purple-400">
                            ₱{post.price.toLocaleString()}
                          </span>
                        </div>
                        <p className="mb-6 flex-1 text-sm text-gray-400 line-clamp-2 leading-relaxed">{post.description}</p>
                        
                        <div className="mt-auto flex items-center gap-3 border-t border-white/5 pt-5">
                          {isPurchased ? (
                            <Button 
                              variant="glass" 
                              className="flex-1 rounded-xl py-3 text-green-400 border-green-500/20 hover:bg-green-500/10"
                              onClick={() => {
                                if (post.type === 'file') {
                                  showAlert('Download Files', `Files: ${post.files?.join(', ') || 'No files available'}`);
                                } else {
                                  showAlert('Account Info', `Username: ${post.account_info?.username}\nPassword: ${post.account_info?.password}`);
                                }
                              }}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              {post.type === 'file' ? 'Download' : 'View Info'}
                            </Button>
                          ) : (
                            <Button 
                              variant="purple" 
                              className="flex-1 rounded-xl py-3" 
                              onClick={() => handleBuy(post)}
                              disabled={post.stock != null && post.stock <= 0}
                            >
                              {post.stock != null && post.stock <= 0 ? 'Out of Stock' : 'Buy Now'}
                            </Button>
                          )}
                          <div className="flex items-center gap-3">
                            <Button 
                              variant="glass"
                              size="icon"
                              onClick={() => handleLikePost(post)}
                              className="rounded-xl text-pink-400 hover:text-pink-300 hover:bg-pink-500/20 border-pink-500/20"
                            >
                              <Zap className={cn("h-4 w-4", (post.likes || 0) > 0 && "fill-pink-400")} />
                              {(post.likes || 0) > 0 && <span className="ml-1 text-[10px] font-black">{post.likes}</span>}
                            </Button>
                            {(isSuperAdmin || isSeller) && (
                              <Button 
                                variant="glass"
                                size="icon"
                                onClick={() => handleDeletePost(post.id)}
                                className="rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/20 border-red-500/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </motion.div>
          )}

          {activeTab === 'feedback' && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto max-w-3xl"
            >
              {/* Feedback Form */}
              <Card glass className="mb-10 p-8 border-white/5">
                <h2 className="mb-6 text-xl font-black text-white uppercase tracking-widest">Share your feedback</h2>
                <div className="space-y-6">
                  <Textarea 
                    placeholder="Write your feedback or proof of purchase here..."
                    value={feedbackContent}
                    onChange={(e) => setFeedbackContent(e.target.value)}
                  />
                  <div className="flex items-center gap-4">
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-gray-300 hover:bg-white/10 transition-all">
                      <Camera className="h-4 w-4 text-purple-400" />
                      Add Proof Image
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'feedback')} />
                    </label>
                    {feedbackImage && (
                      <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-white/20">
                        <img src={feedbackImage} className="h-full w-full object-cover" alt="" />
                        <button 
                          onClick={() => setFeedbackImage(null)}
                          className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white shadow-lg"
                        >
                          <X className="h-2 w-2" />
                        </button>
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="purple"
                    className="w-full py-4 text-sm font-black uppercase tracking-widest" 
                    onClick={handleFeedbackSubmit}
                    isLoading={isSubmittingFeedback}
                    disabled={!feedbackContent}
                  >
                    Post Feedback
                  </Button>
                </div>
              </Card>

              {/* Feedback List */}
              <div className="space-y-8">
                {feedbacks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <MessageSquare className="mb-4 h-16 w-16 opacity-10" />
                    <p className="font-bold uppercase tracking-widest text-xs">No feedback yet. Be the first!</p>
                  </div>
                ) : (
                  feedbacks.map((f) => (
                    <div key={f.id} className="flex gap-6">
                      <div className="h-12 w-12 flex-shrink-0 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-purple-500/20">
                        {f.author_name[0]}
                      </div>
                      <div className="flex-1">
                        <Card glass className="p-6 border-white/5">
                          <div className="mb-3 flex items-center justify-between">
                            <h4 className="font-black text-white tracking-tight">{f.author_name}</h4>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                              {f.created_at ? format(new Date(f.created_at), 'MMM d, h:mm a') : 'Just now'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 leading-relaxed">{f.content}</p>
                          {f.image_url && (
                            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
                              <img src={f.image_url} className="max-h-96 w-full object-cover" alt="Proof" />
                            </div>
                          )}
                        </Card>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'admin' && (isSuperAdmin || isSeller) && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto max-w-2xl"
            >
              <Card glass className="p-10 border-white/5">
                <div className="mb-10 flex items-center gap-4">
                  <div className="rounded-2xl bg-purple-500/20 p-3 text-purple-400 border border-purple-500/20">
                    <PlusCircle className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Post New Item</h2>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Add a new item to your shop feed</p>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Type Selector */}
                  <div>
                    <label className="mb-3 block text-xs font-black text-gray-500 uppercase tracking-widest">Select Post Type</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setPostType('file')}
                        className={cn(
                          "flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all",
                          postType === 'file' ? "border-purple-600 bg-purple-600/10 text-purple-400 shadow-lg shadow-purple-500/10" : "border-white/5 bg-white/5 hover:bg-white/10 text-gray-500"
                        )}
                      >
                        <FileText className="h-8 w-8" />
                        <span className="text-xs font-black uppercase tracking-widest">File</span>
                      </button>
                      <button
                        onClick={() => setPostType('account')}
                        className={cn(
                          "flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all",
                          postType === 'account' ? "border-purple-600 bg-purple-600/10 text-purple-400 shadow-lg shadow-purple-500/10" : "border-white/5 bg-white/5 hover:bg-white/10 text-gray-500"
                        )}
                      >
                        <User className="h-8 w-8" />
                        <span className="text-xs font-black uppercase tracking-widest">Account</span>
                      </button>
                    </div>
                  </div>

                  {/* Common Fields */}
                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-xs font-black text-gray-500 uppercase tracking-widest">Title</label>
                      <Input placeholder="Item title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-black text-gray-500 uppercase tracking-widest">Description</label>
                      <Textarea placeholder="Describe the item..." value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs font-black text-gray-500 uppercase tracking-widest">Price (₱)</label>
                        <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-black text-gray-500 uppercase tracking-widest">Stock</label>
                        <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* Conditional Fields */}
                  {postType === 'file' ? (
                    <div className="space-y-5 rounded-2xl bg-white/5 p-6 border border-white/5">
                      <h3 className="text-xs font-black text-white uppercase tracking-widest">File Details</h3>
                      <div>
                        <label className="mb-2 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 p-8 text-gray-400 hover:border-purple-500/50 hover:text-purple-400 transition-all">
                          <Upload className="h-8 w-8" />
                          <span className="text-sm font-bold">Upload Files</span>
                          <input type="file" className="hidden" multiple onChange={(e) => handleFileChange(e, 'files')} />
                        </label>
                        {files.length > 0 && (
                          <p className="mt-3 text-xs text-purple-400 font-black uppercase tracking-widest text-center">{files.length} files selected</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5 rounded-2xl bg-white/5 p-6 border border-white/5">
                      <h3 className="text-xs font-black text-white uppercase tracking-widest">Account Credentials</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-[10px] font-black text-gray-500 uppercase tracking-widest">Username</label>
                          <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                        </div>
                        <div>
                          <label className="mb-2 block text-[10px] font-black text-gray-500 uppercase tracking-widest">Password</label>
                          <Input placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Image Upload */}
                  <div>
                    <label className="mb-3 block text-xs font-black text-gray-500 uppercase tracking-widest">
                      Item Images {postType === 'account' && "(1-20 images)"}
                    </label>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/5 text-gray-500 hover:border-purple-500/50 hover:text-purple-400 transition-all">
                        <Camera className="h-8 w-8" />
                        <span className="text-[10px] font-black uppercase tracking-widest mt-1">ADD</span>
                        <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'images')} />
                      </label>
                      {images.map((img, i) => (
                        <div key={i} className="relative h-24 w-24 overflow-hidden rounded-2xl border border-white/10 group">
                          <img src={img} className="h-full w-full object-cover" alt="" />
                          <button 
                            onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                            className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    variant="purple"
                    className="w-full py-5 text-sm font-black uppercase tracking-widest" 
                    onClick={handlePost}
                    isLoading={isPosting}
                  >
                    Post Item
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'orders' && user && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto max-w-4xl"
            >
              <div className="mb-10">
                <h2 className="text-4xl font-black text-white tracking-tight italic uppercase">My Orders</h2>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-2">Manage your purchases and chat with sellers</p>
              </div>

              <div className="grid gap-6">
                {purchases.length === 0 ? (
                  <div className="py-20 text-center">
                    <Package className="mx-auto mb-4 h-16 w-16 text-white/5" />
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">You haven't bought anything yet.</p>
                    <Button variant="purple" className="mt-6" onClick={() => setActiveTab('shop')}>
                      Go to Shop
                    </Button>
                  </div>
                ) : (
                  purchases.map((purchase) => {
                    const post = posts.find(p => p.id === purchase.post_id);
                    return (
                      <Card key={purchase.id} glass className="p-6 border-white/5 hover:bg-white/10 transition-all group">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                          <div className="h-24 w-40 shrink-0 overflow-hidden rounded-xl border border-white/10">
                            <img src={post?.images[0]} className="h-full w-full object-cover" alt="" />
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <h3 className="text-xl font-black text-white tracking-tight">{post?.title || 'Unknown Item'}</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">
                              Purchased on {format(new Date(purchase.created_at), 'MMM d, yyyy')}
                            </p>
                            <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-4">
                              <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 border border-white/5">
                                <PhilippinePeso className="h-3 w-3 text-purple-400" />
                                <span className="text-xs font-black text-white">₱{purchase.amount.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 border border-white/5">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Type:</span>
                                <span className="text-xs font-black text-purple-400 uppercase tracking-widest">{post?.type}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button 
                              variant="purple" 
                              className="rounded-xl px-6 py-3"
                              onClick={() => {
                                setActivePurchase(purchase);
                                setActiveTab('chat');
                              }}
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Chat Seller
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'chat' && activePurchase && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto max-w-4xl"
            >
              <div className="mb-8 flex items-center justify-between">
                <Button variant="glass" size="sm" onClick={() => setActiveTab('shop')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Shop
                </Button>
                <div className="text-right">
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">Successful Bought</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Transaction ID: {activePurchase.id}</p>
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-3">
                {/* Product Details */}
                <div className="lg:col-span-1 space-y-6">
                  {posts.find(p => p.id === activePurchase.post_id) && (
                    <Card glass className="p-6 border-white/5 overflow-hidden relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10">
                        <div className="mb-6 aspect-video overflow-hidden rounded-xl border border-white/10">
                          <img 
                            src={posts.find(p => p.id === activePurchase.post_id)?.images[0]} 
                            className="h-full w-full object-cover" 
                            alt="" 
                          />
                        </div>
                        <h3 className="text-xl font-black text-white tracking-tight mb-2">
                          {posts.find(p => p.id === activePurchase.post_id)?.title}
                        </h3>
                        <p className="text-sm text-gray-400 mb-6 line-clamp-3">
                          {posts.find(p => p.id === activePurchase.post_id)?.description}
                        </p>

                        <div className="pt-6 border-t border-white/5 space-y-4">
                          {posts.find(p => p.id === activePurchase.post_id)?.type === 'account' ? (
                            <div className="space-y-3">
                              <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Username</p>
                                <p className="font-mono text-sm text-purple-400 font-black">{posts.find(p => p.id === activePurchase.post_id)?.account_info?.username}</p>
                              </div>
                              <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Password</p>
                                <p className="font-mono text-sm text-purple-400 font-black">{posts.find(p => p.id === activePurchase.post_id)?.account_info?.password}</p>
                              </div>
                            </div>
                          ) : (
                            <Button 
                              variant="purple" 
                              className="w-full py-4 rounded-xl"
                              onClick={() => showAlert('Download', `Files: ${posts.find(p => p.id === activePurchase.post_id)?.files?.join(', ')}`)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download Files
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  )}
                </div>

                {/* Chat System */}
                <div className="lg:col-span-2">
                  <Card glass className="flex h-[600px] flex-col border-white/5 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-purple-500/20">
                          S
                        </div>
                        <div>
                          <p className="text-sm font-black text-white tracking-tight">Seller Support</p>
                          <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                            Online
                          </p>
                        </div>
                      </div>
                      <MessageSquare className="h-5 w-5 text-gray-500" />
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                      {messages.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center px-10">
                          <div className="mb-4 rounded-full bg-white/5 p-4">
                            <MessageSquare className="h-8 w-8 text-gray-600" />
                          </div>
                          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No messages yet.</p>
                          <p className="mt-2 text-xs text-gray-600">Start a conversation with the seller if you have any questions about your purchase.</p>
                        </div>
                      ) : (
                        messages.map((msg) => (
                          <div 
                            key={msg.id} 
                            className={cn(
                              "flex flex-col max-w-[80%]",
                              msg.sender_id === user.id ? "ml-auto items-end" : "mr-auto items-start"
                            )}
                          >
                            <div className={cn(
                              "rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-lg",
                              msg.sender_id === user.id 
                                ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-none" 
                                : "bg-white/5 text-gray-300 border border-white/5 rounded-tl-none"
                            )}>
                              {msg.content}
                            </div>
                            <span className="mt-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                              {format(new Date(msg.created_at), 'h:mm a')}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="border-t border-white/5 bg-white/5 p-4">
                      <div className="flex gap-3">
                        <Input 
                          placeholder="Type your message..." 
                          className="flex-1 bg-white/5 border-white/10"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button 
                          variant="purple" 
                          size="icon" 
                          className="h-12 w-12 rounded-xl shrink-0"
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                        >
                          <Send className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'topup' && user && (
            <motion.div
              key="topup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto max-w-md"
            >
              <Card glass className="p-10 border-white/5">
                <div className="mb-10 text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/20 shadow-lg shadow-purple-500/10">
                    <PhilippinePeso className="h-10 w-10" />
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tight">Top Up Balance</h2>
                  <p className="mt-2 text-xs font-bold text-gray-500 uppercase tracking-widest">1 Balance = ₱1.00</p>
                </div>

                <div className="space-y-8">
                  {/* Honeypot */}
                  <input 
                    type="text" 
                    className="hidden" 
                    value={honeypot} 
                    onChange={(e) => setHoneypot(e.target.value)} 
                    tabIndex={-1} 
                    autoComplete="off" 
                  />
                  <div>
                    <label className="mb-2 block text-xs font-black text-gray-500 uppercase tracking-widest">Amount to Top Up</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 font-black">₱</span>
                      <Input 
                        type="number" 
                        className="pl-10" 
                        placeholder="0.00" 
                        value={topUpAmount} 
                        onChange={(e) => setTopUpAmount(e.target.value)} 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 block text-xs font-black text-gray-500 uppercase tracking-widest">Payment Proof (Receipt)</label>
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/5 p-8 text-gray-400 hover:border-purple-500/50 hover:text-purple-400 transition-all">
                      <Camera className="mb-3 h-8 w-8" />
                      <span className="text-xs font-black uppercase tracking-widest">Upload Receipt</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'topup')} />
                    </label>
                    {topUpProof && (
                      <div className="mt-6 relative h-48 w-full overflow-hidden rounded-2xl border border-white/10 group">
                        <img src={topUpProof} className="h-full w-full object-cover" alt="" />
                        <button onClick={() => setTopUpProof(null)} className="absolute right-3 top-3 rounded-full bg-red-500 p-1.5 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <Button 
                    variant="purple"
                    className="w-full py-5 text-sm font-black uppercase tracking-widest" 
                    onClick={handleTopUpRequest}
                    isLoading={isRequestingTopUp}
                    disabled={!topUpAmount}
                  >
                    Send Request
                  </Button>

                  <div className="rounded-2xl bg-amber-500/10 p-6 border border-amber-500/20">
                    <p className="font-black text-amber-400 text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Instructions:
                    </p>
                    <p className="text-xs text-amber-400/80 leading-relaxed mb-4">Please send your payment to the GCash number below and upload the receipt here. Our team will verify and approve your request shortly.</p>
                    <div className="pt-4 border-t border-amber-500/20">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/60 mb-1">GCash Number:</p>
                      <p className="text-xl font-black text-amber-400 tracking-wider">0994 102 5619</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'inbox' && user && (
            <motion.div
              key="inbox"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto max-w-3xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-white tracking-tight">Inbox</h2>
                {notifications.some(n => !n.is_read) && (
                  <Button 
                    variant="glass" 
                    size="sm" 
                    className="text-[10px] font-black uppercase tracking-widest rounded-xl"
                    onClick={async () => {
                      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
                      for (const id of unreadIds) {
                        await handleMarkAsRead(id);
                      }
                    }}
                  >
                    Mark all as read
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="py-20 text-center">
                    <Bell className="mx-auto mb-4 h-16 w-16 text-white/5" />
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Your inbox is empty.</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <Card 
                      key={notification.id} 
                      glass 
                      className={cn(
                        "p-6 border-white/5 transition-all hover:bg-white/5 group relative",
                        !notification.is_read && "border-l-4 border-l-purple-500 bg-purple-500/5"
                      )}
                      onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={cn(
                              "text-lg font-black tracking-tight",
                              notification.is_read ? "text-gray-300" : "text-white"
                            )}>
                              {notification.title}
                            </h3>
                            {!notification.is_read && (
                              <span className="h-2 w-2 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50 animate-pulse" />
                            )}
                          </div>
                          <p className={cn(
                            "text-sm leading-relaxed",
                            notification.is_read ? "text-gray-500" : "text-gray-300"
                          )}>
                            {notification.content}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mt-4">
                            {notification.created_at ? format(new Date(notification.created_at), 'MMM d, h:mm a') : 'Just now'}
                          </p>
                        </div>
                        <Button 
                          variant="glass" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'requests' && isSuperAdmin && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto max-w-4xl"
            >
              <h2 className="mb-8 text-3xl font-black text-white tracking-tight">Top Up Requests</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {topups.filter(r => r.status === 'pending').length === 0 ? (
                  <div className="col-span-full py-20 text-center">
                    <AlertCircle className="mx-auto mb-4 h-16 w-16 text-white/5" />
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No pending requests.</p>
                  </div>
                ) : (
                  topups.filter(r => r.status === 'pending').map((request) => (
                    <Card key={request.id} glass className="p-6 border-white/5">
                      <div className="mb-6 flex items-start justify-between">
                        <div>
                          <p className="font-black text-white tracking-tight">{request.email}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">
                            {request.created_at ? format(new Date(request.created_at), 'MMM d, h:mm a') : 'Just now'}
                          </p>
                        </div>
                        <span className="text-2xl font-black text-purple-400">₱{request.amount.toLocaleString()}</span>
                      </div>
                      
                      {request.proof_image && (
                        <div className="mb-6 overflow-hidden rounded-2xl border border-white/10">
                          <img src={request.proof_image} className="max-h-64 w-full object-cover" alt="Proof" />
                        </div>
                      )}

                      <div className="flex gap-4">
                        <Button 
                          variant="purple" 
                          className="flex-1 rounded-xl py-3" 
                          onClick={() => handleApproveTopUp(request)}
                          isLoading={processingTopUpId === request.id}
                          disabled={!!processingTopUpId}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button 
                          variant="glass" 
                          className="flex-1 rounded-xl py-3 text-red-400 hover:text-red-300 hover:bg-red-500/20 border-red-500/20" 
                          onClick={() => handleRejectTopUp(request)}
                          disabled={!!processingTopUpId}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              {/* History */}
              <div className="mt-16">
                <h3 className="mb-6 text-xs font-black text-gray-500 uppercase tracking-widest">Recent History</h3>
                <div className="space-y-3">
                  {topups.filter(r => r.status !== 'pending').slice(0, 10).map((r) => (
                    <Card key={r.id} glass className="flex items-center justify-between p-4 border-white/5 hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-3 w-3 rounded-full shadow-lg",
                          r.status === 'approved' ? "bg-green-500 shadow-green-500/20" : "bg-red-500 shadow-red-500/20"
                        )} />
                        <span className="text-sm font-bold text-gray-300">{r.email}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          {r.created_at ? format(new Date(r.created_at), 'MMM d') : 'Now'}
                        </span>
                        <span className="text-sm font-black text-white">₱{r.amount}</span>
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border",
                          r.status === 'approved' ? "text-green-400 bg-green-500/10 border-green-500/20" : "text-red-400 bg-red-500/10 border-red-500/20"
                        )}>
                          {r.status}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'whitelist' && isSuperAdmin && (
            <motion.div
              key="whitelist"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto max-w-2xl"
            >
              <Card glass className="p-10 border-white/5">
                <div className="mb-10 flex items-center gap-4">
                  <div className="rounded-2xl bg-purple-500/20 p-3 text-purple-400 border border-purple-500/20">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Whitelist Sellers</h2>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Add users who can post items to the shop</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <label className="mb-2 block text-xs font-black text-gray-500 uppercase tracking-widest">Search by Username</label>
                    <div className="flex gap-3">
                      <Input 
                        placeholder="Enter username" 
                        value={whitelistUsername} 
                        onChange={(e) => setWhitelistUsername(e.target.value)} 
                        className="flex-1"
                      />
                      <Button 
                        variant="glass" 
                        onClick={handleSearchUser} 
                        isLoading={isSearchingUser}
                        className="px-6"
                      >
                        Search
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-black text-gray-500 uppercase tracking-widest">User Email</label>
                      <Input placeholder="seller@example.com" value={whitelistEmail} onChange={(e) => setWhitelistEmail(e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-black text-gray-500 uppercase tracking-widest">User UID</label>
                      <Input placeholder="Firebase UID" value={whitelistUid} onChange={(e) => setWhitelistUid(e.target.value)} />
                    </div>
                  </div>
                  <Button 
                    variant="purple"
                    className="w-full py-4 text-sm font-black uppercase tracking-widest" 
                    onClick={handleWhitelist}
                    isLoading={isWhitelisting}
                    disabled={!whitelistEmail || !whitelistUid}
                  >
                    Add to Whitelist
                  </Button>
                </div>

                <div className="mt-12">
                  <h3 className="mb-6 text-xs font-black text-gray-500 uppercase tracking-widest">Current Sellers</h3>
                  <div className="space-y-3">
                    {sellers.length === 0 ? (
                      <p className="text-sm text-gray-500 italic text-center py-6">No whitelisted sellers yet.</p>
                    ) : (
                      sellers.map((s) => (
                        <Card glass key={s.id} className="flex items-center justify-between p-4 border-white/5 bg-white/5">
                          <div>
                            <p className="text-sm font-black text-white tracking-tight">{s.email}</p>
                            <p className="text-[10px] font-bold text-gray-500 font-mono mt-1">{s.uid}</p>
                          </div>
                          <Button 
                            variant="glass"
                            size="icon"
                            onClick={() => handleRemoveSeller(s.id)}
                            className="rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/20 border-red-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Modal 
        isOpen={modalConfig.isOpen} 
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        title={modalConfig.title}
        footer={
          modalConfig.type === 'confirm' ? (
            <>
              <Button variant="glass" onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}>Cancel</Button>
              <Button variant="purple" onClick={() => {
                modalConfig.onConfirm?.();
                setModalConfig(prev => ({ ...prev, isOpen: false }));
              }}>Confirm</Button>
            </>
          ) : (
            <Button variant="purple" onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}>OK</Button>
          )
        }
      >
        <p className="text-gray-300 leading-relaxed">{modalConfig.message}</p>
      </Modal>

      {/* Auth Modal */}
      <Modal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title={authMode === 'login' ? 'LOGIN' : 'SIGN IN'}
      >
        <div className="space-y-6">
          {authMode === 'login' ? (
            <>
              <div>
                <label className="mb-2 block text-xs font-black text-gray-500 uppercase tracking-widest">USERNAME:</label>
                <Input 
                  placeholder="Enter username" 
                  value={authUsername} 
                  onChange={(e) => setAuthUsername(e.target.value)} 
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-black text-gray-500 uppercase tracking-widest">PASSWORD:</label>
                <Input 
                  type="password" 
                  placeholder="Enter password" 
                  value={authPassword} 
                  onChange={(e) => setAuthPassword(e.target.value)} 
                />
              </div>
              <Button 
                variant="purple" 
                className="w-full py-4 text-sm font-black uppercase tracking-widest" 
                onClick={handleLogin}
                isLoading={isAuthenticating}
              >
                Login
              </Button>
              <p className="text-center text-xs text-gray-500">
                Don't have an account?{' '}
                <button 
                  onClick={() => { setAuthMode('signup'); setAuthUsername(''); setAuthPassword(''); }} 
                  className="text-purple-400 hover:underline font-bold"
                >
                  SIGN IN
                </button>
              </p>
            </>
          ) : (
            <>
              <div>
                <label className="mb-2 block text-xs font-black text-gray-500 uppercase tracking-widest">USERNAME:</label>
                <Input 
                  placeholder="Choose username" 
                  value={authUsername} 
                  onChange={(e) => setAuthUsername(e.target.value)} 
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-black text-gray-500 uppercase tracking-widest">ENTER. PASSWORD:</label>
                <Input 
                  type="password" 
                  placeholder="Enter password" 
                  value={authPassword} 
                  onChange={(e) => setAuthPassword(e.target.value)} 
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-black text-gray-500 uppercase tracking-widest">REPEAT PASSWORD:</label>
                <Input 
                  type="password" 
                  placeholder="Repeat password" 
                  value={authRepeatPassword} 
                  onChange={(e) => setAuthRepeatPassword(e.target.value)} 
                />
              </div>
              <Button 
                variant="purple" 
                className="w-full py-4 text-sm font-black uppercase tracking-widest" 
                onClick={handleSignUp}
                isLoading={isAuthenticating}
              >
                CREATE ACCOUNT
              </Button>
              <p className="text-center text-xs text-gray-500">
                Already have an account?{' '}
                <button 
                  onClick={() => { setAuthMode('login'); setAuthUsername(''); setAuthPassword(''); }} 
                  className="text-purple-400 hover:underline font-bold"
                >
                  LOGIN
                </button>
              </p>
            </>
          )}
        </div>
      </Modal>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/5 bg-black/20 py-16 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="flex justify-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-purple-500 border border-white/10">
              <ShoppingBag className="h-6 w-6" />
            </div>
          </div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">© 2026 Cosmic Shop. All rights reserved.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-8">
            <span className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4 text-purple-500" />
              Secure Payments
            </span>
            <span className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-widest">
              <Tag className="h-4 w-4 text-purple-500" />
              Best Prices
            </span>
            <span className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-widest">
              <PhilippinePeso className="h-4 w-4 text-purple-500" />
              GCash: 0994 102 5619
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
