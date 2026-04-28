import { useEffect, useState } from "react";

const KEY = "dummy_auth_user";

type DummyUser = { id: string; email: string; display_name: string };

function read(): DummyUser | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function dummySignIn(email: string, displayName?: string) {
  const u: DummyUser = {
    id: `dummy-${btoa(email).replace(/=/g, "")}`,
    email,
    display_name: displayName || email.split("@")[0],
  };
  localStorage.setItem(KEY, JSON.stringify(u));
  window.dispatchEvent(new Event("dummy-auth-change"));
  return u;
}

export function dummySignOut() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("dummy-auth-change"));
}

export function useAuth() {
  const [user, setUser] = useState<DummyUser | null>(() => read());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sync = () => setUser(read());
    window.addEventListener("dummy-auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("dummy-auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { session: user ? { user } : null, user, loading };
}
