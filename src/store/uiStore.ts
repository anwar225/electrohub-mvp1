interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
}

// Simple UI store using localStorage
const STORAGE_KEY = 'electrohub-ui';

const getStoredUI = (): { sidebarOpen: boolean } => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error parsing stored UI:', e);
  }
  return { sidebarOpen: false };
};

const setStoredUI = (sidebarOpen: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ sidebarOpen }));
  } catch (e) {
    console.error('Error storing UI:', e);
  }
};

export const useUIStore = () => {
  const state = getStoredUI();
  
  return {
    sidebarOpen: state.sidebarOpen,
    toggleSidebar: () => {
      const newState = !state.sidebarOpen;
      setStoredUI(newState);
    },
    setSidebar: (open: boolean) => {
      setStoredUI(open);
    },
  };
};
