import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { API_CONFIG } from '@/lib/apiConfig';

interface User {
  id: string;
  email?: string;
  full_name?: string;
  phone?: string;
  role?: string;
}

interface Session {
  access_token: string;
  token_type: string;
}

// Helper function to decode JWT tokens
function parseJwt(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to get stored session
const getStoredSession = (): { user: User | null; session: Session | null } => {
  try {
    const storedUser = localStorage.getItem('user');
    const storedSession = localStorage.getItem('session');
    
    return {
      user: storedUser ? JSON.parse(storedUser) : null,
      session: storedSession ? JSON.parse(storedSession) : null
    };
  } catch (error) {
    console.error('Error parsing stored session:', error);
    return { user: null, session: null };
  }
};

// Helper function to store session
const storeSession = (user: User | null, session: Session | null) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
  
  if (session) {
    localStorage.setItem('session', JSON.stringify(session));
  } else {
    localStorage.removeItem('session');
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const { user: storedUser, session: storedSession } = getStoredSession();
    if (storedUser && storedSession) {
      setUser(storedUser);
      setSession(storedSession);
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.USERS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const userData = await response.json();
      
      // Login after registration
      const loginResponse = await fetch(API_CONFIG.ENDPOINTS.USERS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        throw new Error(errorData.detail || 'Login failed after registration');
      }

      const loginData = await loginResponse.json();
      
      const newUser = {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role
      };

      setUser(newUser);
      setSession(loginData);
      storeSession(newUser, loginData);

      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.USERS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      
      // Decode JWT to get user ID
      const tokenPayload = parseJwt(data.access_token);
      
      // Fetch user profile to get actual role
      const profileResponse = await fetch(API_CONFIG.ENDPOINTS.USERS.PROFILE, {
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
        },
      });
      
      let userObj;
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        userObj = {
          id: tokenPayload.user_id,
          email,
          full_name: profileData.full_name,
          phone: profileData.phone,
          role: profileData.role || 'user'
        };
      } else {
        // Fallback to basic user object
        userObj = {
          id: tokenPayload.user_id,
          email,
          role: 'user'
        };
      }

      setUser(userObj);
      setSession(data);
      storeSession(userObj, data);

      return { error: null };
    } catch (error) {
      console.error('Signin error:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      // Clear local storage
      storeSession(null, null);
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Signout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
