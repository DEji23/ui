'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface Passenger {
  id: string;
  name: string;
  boardingType: 'qr' | 'manual';
  stop: string;
}

interface AppState {
  // Driver info
  driverName: string;
  driverCode: string;
  driverPhone: string;

  // Bus info
  busCode: string;
  route: string;
  routeFrom: string;
  routeTo: string;
  capacity: number;
  depot: string;

  // Shift state
  isShiftActive: boolean;
  setIsShiftActive: (v: boolean) => void;
  shiftStartTime: string;
  tripsToday: number;

  // Passengers
  passengers: Passenger[];
  addPassenger: (p: Omit<Passenger, 'id'>) => void;
  removePassenger: (id: string) => void;
  setPassengers: (passengers: Passenger[]) => void;

  // Financials
  cashCollected: number;
  setCashCollected: (v: number) => void;
  walletEarnings: number;
  setWalletEarnings: (v: number) => void;

  // Emergency
  isEmergencyActive: boolean;
  triggerEmergency: () => void;

  // Login state
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  wrongPinAttempts: number;
  incrementWrongPin: () => void;
  resetWrongPin: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [passengers, setPassengers] = useState<Passenger[]>([
    { id: '1', name: 'Amaka Obi', boardingType: 'qr', stop: 'Oshodi' },
    { id: '2', name: 'Tunde Bakare', boardingType: 'qr', stop: 'Oshodi' },
    { id: '3', name: 'Ngozi Eze', boardingType: 'manual', stop: 'Oshodi' },
    { id: '4', name: 'Emeka Nwosu', boardingType: 'qr', stop: 'Oshodi' },
  ]);
  const [cashCollected, setCashCollected] = useState(3500);
  const [walletEarnings, setWalletEarnings] = useState(1250);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [wrongPinAttempts, setWrongPinAttempts] = useState(0);

  const addPassenger = useCallback((p: Omit<Passenger, 'id'>) => {
    setPassengers((prev) => [
      ...prev,
      { ...p, id: Math.random().toString(36).slice(2) },
    ]);
  }, []);

  const removePassenger = useCallback((id: string) => {
    setPassengers((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const triggerEmergency = useCallback(() => {
    // Silent trigger — no visual change on drive mode screen
    console.log('[KOJA EMERGENCY] Code Red triggered at', new Date().toISOString());
    setIsEmergencyActive(true);
  }, []);

  const incrementWrongPin = useCallback(() => {
    setWrongPinAttempts((prev) => prev + 1);
  }, []);

  const resetWrongPin = useCallback(() => {
    setWrongPinAttempts(0);
  }, []);

  const value: AppState = {
    driverName: 'Ibrahim Adeyemi',
    driverCode: 'DRV-4821',
    driverPhone: '+234 801 234 5678',
    busCode: 'LG-458-KA',
    route: 'Oshodi → CMS',
    routeFrom: 'Oshodi',
    routeTo: 'CMS',
    capacity: 18,
    depot: 'Mile 2 Depot',
    isShiftActive,
    setIsShiftActive,
    shiftStartTime: '6:30 AM',
    tripsToday: 4,
    passengers,
    addPassenger,
    removePassenger,
    setPassengers,
    cashCollected,
    setCashCollected,
    walletEarnings,
    setWalletEarnings,
    isEmergencyActive,
    triggerEmergency,
    isLoggedIn,
    setIsLoggedIn,
    wrongPinAttempts,
    incrementWrongPin,
    resetWrongPin,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
