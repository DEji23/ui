'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';

interface Passenger {
  id: string;
  name: string;
  type: 'qr' | 'manual';
  boardedAt: string;
}

interface AppState {
  // Driver
  driverName: string;
  driverCode: string;
  driverPhone: string;
  // Bus / shift
  busCode: string;
  route: string;
  routeFrom: string;
  routeTo: string;
  capacity: number;
  depot: string;
  isShiftActive: boolean;
  setShiftActive: (v: boolean) => void;
  // Passengers
  passengers: Passenger[];
  addPassenger: (p: Passenger) => void;
  setPassengers: (ps: Passenger[]) => void;
  // Financials
  cashCollected: number;
  setCashCollected: (v: number) => void;
  walletEarnings: number;
  setWalletEarnings: (v: number) => void;
  // Emergency
  triggerEmergency: () => void;
  // PIN lock
  pinAttempts: number;
  setPinAttempts: (v: number) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isShiftActive, setShiftActive] = useState(false);
  const [passengers, setPassengers] = useState<Passenger[]>([
    { id: '1', name: 'Amaka O.', type: 'qr', boardedAt: '9:05 AM' },
    { id: '2', name: 'Bello T.', type: 'manual', boardedAt: '9:07 AM' },
    { id: '3', name: 'Chisom E.', type: 'qr', boardedAt: '9:10 AM' },
    { id: '4', name: 'Dami F.', type: 'qr', boardedAt: '9:12 AM' },
  ]);
  const [cashCollected, setCashCollected] = useState(3500);
  const [walletEarnings, setWalletEarnings] = useState(1250);
  const [pinAttempts, setPinAttempts] = useState(0);

  const addPassenger = useCallback((p: Passenger) => {
    setPassengers((prev) => [...prev, p]);
  }, []);

  const triggerEmergency = useCallback(() => {
    // Silent trigger — no visual change on screen
    console.log('[KOJA EMERGENCY] Code Red triggered silently at', new Date().toISOString());
  }, []);

  return (
    <AppContext.Provider
      value={{
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
        setShiftActive,
        passengers,
        addPassenger,
        setPassengers,
        cashCollected,
        setCashCollected,
        walletEarnings,
        setWalletEarnings,
        triggerEmergency,
        pinAttempts,
        setPinAttempts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
