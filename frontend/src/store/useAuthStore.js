import { create } from 'zustand';

const getInitialToken = () => {
  const t = localStorage.getItem('token');
  return t && t !== 'undefined' ? t : null;
};

const getInitialUser = () => {
  try {
    const u = localStorage.getItem('user');
    return u && u !== 'undefined' ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};

const useAuthStore = create((set) => ({
  token: getInitialToken(),
  user: getInitialUser(),
  
  login: (arg1, arg2) => {
    let token = typeof arg1 === 'string' ? arg1 : arg2;
    let user = typeof arg1 === 'object' ? arg1 : arg2;
    if (token && token !== 'undefined') {
      localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', JSON.stringify(user));
      set({ token, user });
    }
  },
  
  updateUser: (updatedUser) => {
    if (updatedUser) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  }
}));

export default useAuthStore;
