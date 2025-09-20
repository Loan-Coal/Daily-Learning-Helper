export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Login failed');
    // Unwrap if backend returns { success, data: { token, user } }
    if (data.data && data.data.token) {
        return data.data;
    }
    return data;
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Register failed');
    // Unwrap if backend returns { success, data: { token, user } }
    if (data.data && data.data.token) {
        return data.data;
    }
    return data;
}

export async function getMe(token: string): Promise<AuthUser> {
  const res = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Session expired');
  return (await res.json()).data;
}
