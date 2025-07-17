import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'hi' | 'te' | 'ta' | 'kn' | 'ml';
  notifications: Notification[];
  unreadNotificationCount: number;
  loading: {
    global: boolean;
    dashboard: boolean;
    farmers: boolean;
    products: boolean;
    campaigns: boolean;
  };
  modals: {
    farmerForm: boolean;
    productForm: boolean;
    campaignForm: boolean;
    settings: boolean;
  };
}

const initialState: UIState = {
  sidebarCollapsed: false,
  theme: 'light',
  language: 'en',
  notifications: [],
  unreadNotificationCount: 0,
  loading: {
    global: false,
    dashboard: false,
    farmers: false,
    products: false,
    campaigns: false,
  },
  modals: {
    farmerForm: false,
    productForm: false,
    campaignForm: false,
    settings: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<'en' | 'hi' | 'te' | 'ta' | 'kn' | 'ml'>) => {
      state.language = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
        read: false,
      };
      state.notifications.unshift(notification);
      state.unreadNotificationCount += 1;
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadNotificationCount = Math.max(0, state.unreadNotificationCount - 1);
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadNotificationCount = 0;
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.read) {
          state.unreadNotificationCount = Math.max(0, state.unreadNotificationCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },
    setLoading: (state, action: PayloadAction<{ key: keyof UIState['loading']; value: boolean }>) => {
      state.loading[action.payload.key] = action.payload.value;
    },
    setModal: (state, action: PayloadAction<{ key: keyof UIState['modals']; value: boolean }>) => {
      state.modals[action.payload.key] = action.payload.value;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  setTheme,
  setLanguage,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  setLoading,
  setModal,
} = uiSlice.actions;

export default uiSlice.reducer;