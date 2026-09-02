import React from 'react';

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

let uiState = getStoredUI();
const listeners = new Set<() => void>();

export const useUIStore = () => {
  const [, forceUpdate] = React.useState({});

  React.useEffect(() => {
    const listener = () => forceUpdate({});
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  return {
    sidebarOpen: uiState.sidebarOpen,
    toggleSidebar: () => {
      uiState = { sidebarOpen: !uiState.sidebarOpen };
      setStoredUI(uiState.sidebarOpen);
      listeners.forEach(l => l());
    },
    setSidebar: (open: boolean) => {
      uiState = { sidebarOpen: open };
      setStoredUI(open);
      listeners.forEach(l => l());
    },
  };
};
