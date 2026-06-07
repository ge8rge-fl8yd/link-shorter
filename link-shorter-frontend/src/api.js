export const API_URL = 'http://localhost:8000'; 

const getHeaders = (isForm = false) => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (!isForm) {
    headers['Content-Type'] = 'application/json';
  } else {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth API
  register: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/registration`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  login: async (username, password) => {
    // Кодируем как x-www-form-urlencoded для OAuth2Form
    const body = new URLSearchParams({ username, password });
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(true),
      body: body.toString(),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  verify: async (token) => {
    const res = await fetch(`${API_URL}/auth/verificate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ access_token: token }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  resetPasswordRequest: async (email) => {
    const res = await fetch(`${API_URL}/auth/reset-password/request`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  resetPasswordConfirm: async (token, newPassword) => {
    const res = await fetch(`${API_URL}/auth/reset-password/confirm`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ access_token: token, new_password: newPassword }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  deleteAccountRequest: async () => {
    const res = await fetch(`${API_URL}/auth/delete-account/request`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  deleteAccountConfirm: async (token, otp) => {
    const res = await fetch(`${API_URL}/auth/delete-account/confirm`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ access_token: token, one_time_password: otp }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

    getUserLinks: async (limit = 8, offset = 0) => {
    const queryParams = new URLSearchParams({ limit, offset }).toString();
    
    const res = await fetch(`${API_URL}/links/user_links/?${queryParams}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    if (!res.ok) throw await res.json();
    return res.json();
  },
  addLink: async (link) => {
    const res = await fetch(`${API_URL}/links/add_link`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ link }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  deleteLink: async (slug) => {
    const res = await fetch(`${API_URL}/links/delete_link?slug=${slug}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
  
  loginWithGoogle: async (code) => {
    // Заменили BASE_URL на API_URL
    const response = await fetch(`${API_URL}/auth/google/login?code=${encodeURIComponent(code)}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { detail: errorData.detail || 'GOOGLE_AUTH_VERIFICATION_FAILED' };
    }

    return await response.json(); 
  },
};