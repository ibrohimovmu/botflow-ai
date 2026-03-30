import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../supabase';
import { User } from '@supabase/supabase-js';

export type Page = 'landing' | 'auth' | 'builder' | 'promo' | 'portfolio' | 'showcase' | 'author';
export type Panel = 'chat' | 'code' | 'test';
export type BotStatus = 'idle' | 'building' | 'testing' | 'running' | 'stopped' | 'expired';

export interface PublicBot {
  id?: string;
  name: string;
  username: string;
  description: string;
  category: string;
  author_email: string;
  created_at?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  isCode?: boolean;
}

export interface BotLog {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  generatedCode: string;
  botToken: string;
  botName: string;
  botStatus: BotStatus;
  instructions: string;
  kbData: string;
  logs: BotLog[];
  createdAt: number;
  lastModified: number;
}

interface AppState {
  page: Page;
  setPage: (p: Page) => void;
  isLoggedIn: boolean;
  user: User | null;
  userEmail: string;
  login: (email: string) => void;
  logout: () => void;
  messages: Message[];
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => string;
  updateMessage: (id: string, content: string, done?: boolean) => void;
  generatedCode: string;
  setGeneratedCode: (c: string) => void;
  botToken: string;
  setBotToken: (t: string) => void;
  botStatus: BotStatus;
  setBotStatus: (s: BotStatus) => void;
  countdown: number;
  setCountdown: (n: number) => void;
  logs: BotLog[];
  addLog: (msg: string, type?: BotLog['type']) => void;
  clearLogs: () => void;
  showCodePanel: boolean;
  setShowCodePanel: (v: boolean) => void;
  showConfetti: boolean;
  setShowConfetti: (v: boolean) => void;
  botName: string;
  setBotName: (n: string) => void;
  mobilePanel: Panel;
  setMobilePanel: (p: Panel) => void;
  // Multi-session
  sessions: ChatSession[];
  activeSessionId: string | null;
  activeSession: ChatSession | null;
  createNewSession: () => void;
  switchSession: (id: string) => void;
  deleteSession: (id: string) => void;
  renameSession: (id: string, name: string) => void;
  // Monetization
  isPro: boolean;
  setIsPro: (v: boolean) => void;
  showPaywall: boolean;
  setShowPaywall: (v: boolean) => void;
  // Global Showcase
  publishBot: (b: PublicBot) => Promise<void>;
  publicBots: PublicBot[];
  fetchPublicBots: () => Promise<void>;
}

const AppContext = createContext<AppState>({} as AppState);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [page, setPage] = useState<Page>('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [generatedCode, setGeneratedCode] = useState('');
  const [botToken, setBotToken] = useState('');
  const [botStatus, setBotStatus] = useState<BotStatus>('idle');
  const [countdown, setCountdown] = useState(600);
  const [logs, setLogs] = useState<BotLog[]>([]);
  const [showCodePanel, setShowCodePanel] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [botName, setBotName] = useState('MyBot');
  const [mobilePanel, setMobilePanel] = useState<Panel>('chat');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [publicBots, setPublicBots] = useState<PublicBot[]>([]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  const syncActiveToState = useCallback((s: ChatSession | null) => {
    if (!s) {
      setMessages([]);
      setGeneratedCode('');
      setBotToken('');
      setBotStatus('idle');
      setLogs([]);
      setBotName('MyBot');
      return;
    }
    setMessages(s.messages);
    setGeneratedCode(s.generatedCode);
    setBotToken(s.botToken);
    setBotStatus(s.botStatus);
    setLogs(s.logs);
    setBotName(s.botName);
  }, []);

  useEffect(() => {
    if (window.location.hash === '#promo') {
      setPage('promo');
      return;
    }

    // 1. Check for mock session first
    const savedEmail = localStorage.getItem('botflow_mock_user');
    if (savedEmail) {
      setIsLoggedIn(true);
      setUserEmail(savedEmail);
      setPage('builder');
    } else {
      // 2. Check real Supabase session if no mock
      supabase.auth.getSession().then(({ data }: any) => {
        const session = data?.session;
        if (session?.user) {
          setIsLoggedIn(true);
          setUser(session.user);
          setUserEmail(session.user.email || '');
          setPage('builder');
        }
      });
    }

    // 3. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setUser(session.user);
        setUserEmail(session.user.email || '');
        setPage('builder');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user data when email is known
  useEffect(() => {
    if (userEmail) {
      const saved = localStorage.getItem(`botflow_sessions_${userEmail}`);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (Array.isArray(data.sessions)) {
            const loadedSessions = data.sessions.map((s: any) => ({
              ...s,
              messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })),
              logs: s.logs.map((l: any) => ({ ...l, timestamp: new Date(l.timestamp) }))
            }));
            setSessions(loadedSessions);
            const lastActive = data.activeSessionId || (loadedSessions.length > 0 ? loadedSessions[0].id : null);
            const lastSession = loadedSessions.find((s: any) => s.id === lastActive);
            
            // Auto start a new session if the last one was already used
            if (lastSession && lastSession.messages.length > 0) {
              const newSession: ChatSession = {
                id: Math.random().toString(36).slice(2),
                name: 'Yangi Bot',
                messages: [],
                generatedCode: '',
                botToken: '',
                botName: 'MyBot',
                botStatus: 'idle',
                instructions: '',
                kbData: '',
                logs: [],
                createdAt: Date.now(),
                lastModified: Date.now()
              };
              setSessions([newSession, ...loadedSessions]);
              setActiveSessionId(newSession.id);
              syncActiveToState(newSession);
            } else {
              setActiveSessionId(lastActive);
              if (lastSession) syncActiveToState(lastSession);
            }
          }
        } catch (e) {
          console.error("Local data load error", e);
        }
      } else {
        // Migration from old single-session format
        const oldSaved = localStorage.getItem(`botflow_data_${userEmail}`);
        if (oldSaved) {
          try {
            const oldData = JSON.parse(oldSaved);
            const firstSession: ChatSession = {
              id: 'initial',
              name: 'Birinchi Loyiha',
              messages: oldData.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })),
              generatedCode: oldData.generatedCode || '',
              botToken: oldData.botToken || '',
              botName: oldData.botName || 'MyBot',
              botStatus: 'idle',
              instructions: '',
              kbData: '',
              logs: oldData.logs.map((l: any) => ({ ...l, timestamp: new Date(l.timestamp) })),
              createdAt: Date.now(),
              lastModified: Date.now()
            };
            setSessions([firstSession]);
            setActiveSessionId(firstSession.id);
            syncActiveToState(firstSession);
          } catch(e) {}
        } else {
          // New user
          createNewSession();
        }
      }
      setIsDataLoaded(true);
    } else {
      setIsDataLoaded(false);
      setSessions([]);
      setActiveSessionId(null);
    }
  }, [userEmail]);

  // Save changes automatically
  useEffect(() => {
    if (userEmail && isDataLoaded) {
      // Update the active session in the array before saving
      const updatedSessions = sessions.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages,
            generatedCode,
            botToken,
            botName,
            botStatus,
            logs,
            lastModified: Date.now()
          };
        }
        return s;
      });
      
      localStorage.setItem(`botflow_sessions_${userEmail}`, JSON.stringify({
        sessions: updatedSessions,
        activeSessionId
      }));
    }
  }, [userEmail, isDataLoaded, messages, generatedCode, botToken, logs, botName, botStatus, sessions, activeSessionId]);

  const login = useCallback((email: string) => {
    localStorage.setItem('botflow_mock_user', email);
    setIsLoggedIn(true);
    setUserEmail(email);
    setPage('builder');
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('botflow_mock_user');
    setIsLoggedIn(false);
    setUser(null);
    setUserEmail('');
    setPage('landing');
    setMessages([]);
    setGeneratedCode('');
    setBotToken('');
    setBotStatus('idle');
    setLogs([]);
    setShowCodePanel(false);
    setCountdown(600);
  }, []);

  const addMessage = useCallback((msg: Omit<Message, 'id' | 'timestamp'>): string => {
    const id = Math.random().toString(36).slice(2);
    setMessages(prev => [...prev, { ...msg, id, timestamp: new Date() }]);
    return id;
  }, []);

  const updateMessage = useCallback((id: string, content: string, done = false) => {
    setMessages(prev =>
      prev.map(m => m.id === id ? { ...m, content, isTyping: !done } : m)
    );
  }, []);

  const addLog = useCallback((message: string, type: BotLog['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setLogs(prev => [...prev.slice(-49), { id, message, type, timestamp: new Date() }]);
  }, []);

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: Math.random().toString(36).slice(2),
      name: 'Yangi Bot',
      messages: [],
      generatedCode: '',
      botToken: '',
      botName: 'MyBot',
      botStatus: 'idle',
      instructions: '',
      kbData: '',
      logs: [],
      createdAt: Date.now(),
      lastModified: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    syncActiveToState(newSession);
    setShowCodePanel(false);
    setMobilePanel('chat');
  }, [syncActiveToState]);

  const switchSession = useCallback((id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      setActiveSessionId(id);
      syncActiveToState(session);
      setShowCodePanel(!!session.generatedCode);
      setMobilePanel('chat');
    }
  }, [sessions, syncActiveToState]);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (id === activeSessionId) {
        if (filtered.length > 0) {
          setActiveSessionId(filtered[0].id);
          syncActiveToState(filtered[0]);
        } else {
          setActiveSessionId(null);
          syncActiveToState(null);
        }
      }
      return filtered;
    });
  }, [activeSessionId, syncActiveToState]);

  const renameSession = useCallback((id: string, name: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, name } : s));
  }, []);

  const fetchPublicBots = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('public_bots')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setPublicBots(data);
    } catch (e) {
      console.warn("Public bots fetch failed (table might not exist yet):", e);
      // Fallback to mock data if table doesn't exist
      setPublicBots([
        { name: "Shop Bot", username: "SampleShopBot", description: "Clothing store with order management", category: "E-commerce", author_email: "demo@botflow.ai" },
        { name: "Support AI", username: "HelpAssistBot", description: "24/7 Customer support assistant", category: "Support", author_email: "demo@botflow.ai" }
      ]);
    }
  }, []);

  const publishBot = useCallback(async (bot: PublicBot) => {
    try {
      const { error } = await supabase.from('public_bots').upsert(bot);
      if (error) throw error;
      await fetchPublicBots();
    } catch (e) {
      console.warn("Publish failed:", e);
    }
  }, [fetchPublicBots]);

  useEffect(() => {
    fetchPublicBots();
  }, [fetchPublicBots]);

  const clearLogs = useCallback(() => setLogs([]), []);

  return (
    <AppContext.Provider value={{
      page, setPage,
      isLoggedIn, user, userEmail, login, logout,
      messages, addMessage, updateMessage,
      generatedCode, setGeneratedCode,
      botToken, setBotToken,
      botStatus, setBotStatus,
      countdown, setCountdown,
      logs, addLog, clearLogs,
      showCodePanel, setShowCodePanel,
      showConfetti, setShowConfetti,
      botName, setBotName,
      mobilePanel, setMobilePanel,
      sessions, activeSessionId, activeSession,
      createNewSession, switchSession, deleteSession, renameSession,
      isPro, setIsPro, showPaywall, setShowPaywall,
      publishBot, publicBots, fetchPublicBots
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

