/**
 * CMS Auth Context — checks if the current visitor is a logged-in Payload admin.
 * When authenticated, inline editing controls become visible on the frontend.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface CmsAuth {
  isAdmin: boolean;
  user: { email: string } | null;
  logout: () => void;
}

const CmsAuthContext = createContext<CmsAuth>({ isAdmin: false, user: null, logout: () => {} });

const CMS_URL = import.meta.env.VITE_CMS_URL || 'http://localhost:3000';

export function CmsAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    // Check if the visitor has a valid Payload session
    fetch(`${CMS_URL}/api/users/me`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user?.email) {
          setUser({ email: data.user.email });
        }
      })
      .catch(() => {});
  }, []);

  const logout = () => {
    fetch(`${CMS_URL}/api/users/logout`, {
      method: 'POST',
      credentials: 'include',
    }).finally(() => setUser(null));
  };

  return (
    <CmsAuthContext.Provider value={{ isAdmin: !!user, user, logout }}>
      {children}
    </CmsAuthContext.Provider>
  );
}

export function useCmsAuth() {
  return useContext(CmsAuthContext);
}
