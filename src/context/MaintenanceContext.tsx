import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '@/services/api';
import type { AppSettingItem } from '@/types';

interface MaintenanceContextType {
  isMaintenanceMode: boolean;
  loading: boolean;
  checkMaintenanceMode: () => Promise<boolean>;
  appSettings: AppSettingItem[];
  supportEmail: string;
  supportPhone: string;
  appName: string;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export const MaintenanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [appSettings, setAppSettings] = useState<AppSettingItem[]>([]);
  const [supportEmail, setSupportEmail] = useState<string>('support@practicekoro.online');
  const [supportPhone, setSupportPhone] = useState<string>('+91 98765 43210');
  const [appName, setAppName] = useState<string>('PracticeKoro');

  const checkMaintenanceMode = useCallback(async (): Promise<boolean> => {
    try {
      const settings = await api.getAppSettings();
      setAppSettings(settings);

      const maintSetting = settings.find(
        (s) => s.id === 'sys_maintenance_mode' || s.key === 'maintenance_mode'
      );
      const isMaint = maintSetting?.value === true || maintSetting?.value === 'true';
      setIsMaintenanceMode(isMaint);

      const emailSetting = settings.find(
        (s) => s.id === 'general_support_email' || s.key === 'support_email'
      );
      if (emailSetting?.value) setSupportEmail(String(emailSetting.value));

      const phoneSetting = settings.find(
        (s) => s.id === 'general_support_phone' || s.key === 'support_phone'
      );
      if (phoneSetting?.value) setSupportPhone(String(phoneSetting.value));

      const nameSetting = settings.find(
        (s) => s.id === 'general_app_name' || s.key === 'app_name'
      );
      if (nameSetting?.value) setAppName(String(nameSetting.value));

      return isMaint;
    } catch (err) {
      console.warn('Failed to load maintenance mode status:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkMaintenanceMode();

    // Periodic check every 60 seconds
    const interval = setInterval(() => {
      checkMaintenanceMode();
    }, 60000);

    // Re-check when window gains focus
    const handleFocus = () => {
      checkMaintenanceMode();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkMaintenanceMode]);

  return (
    <MaintenanceContext.Provider
      value={{
        isMaintenanceMode,
        loading,
        checkMaintenanceMode,
        appSettings,
        supportEmail,
        supportPhone,
        appName,
      }}
    >
      {children}
    </MaintenanceContext.Provider>
  );
};

export const useMaintenance = (): MaintenanceContextType => {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
};
