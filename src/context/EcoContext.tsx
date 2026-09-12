import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserEntity,
  BinStation,
  DisposalLogEntity,
  WalletTransactionEntity,
  DisposalStatus,
  ScreenRoute,
  UserRole,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_BIN_STATIONS,
  INITIAL_DISPOSALS,
  INITIAL_TRANSACTIONS,
} from '../data/initialData';

interface EcoContextType {
  currentRoute: ScreenRoute;
  setCurrentRoute: (route: ScreenRoute) => void;
  currentUser: UserEntity | null;
  isAuthenticated: boolean;
  users: UserEntity[];
  binStations: BinStation[];
  disposals: DisposalLogEntity[];
  transactions: WalletTransactionEntity[];
  draftCategory: string;
  draftSubCategory: string;
  draftWeightKg: string;
  setDraftDetails: (category: string, subCategory: string, weightKg: string) => void;
  login: (usernameOrEmail: string, password: string) => { success: boolean; message: string; user?: UserEntity };
  signup: (params: {
    name: string;
    username: string;
    email: string;
    password: string;
    phone: string;
    ward: string;
    upiId: string;
    avatarId?: string;
  }) => { success: boolean; message: string; user?: UserEntity };
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => { success: boolean; message: string };
  switchUser: (userId: string) => void;
  submitDisposal: (params: {
    weightKg: number;
    binLocation: string;
    imageProofUri?: string;
    category?: string;
    subCategory?: string;
  }) => { log: DisposalLogEntity; pointsAwarded: number };
  requestWithdrawal: (
    points: number,
    payoutMethod: 'UPI' | 'Bank Transfer',
    destination: string
  ) => { success: boolean; message: string };
  updateUserProfile: (params: {
    name: string;
    phone: string;
    upiId: string;
    ward: string;
    avatarId: string;
  }) => void;
  adminApprovePayout: (txId: string) => void;
  adminRejectPayout: (txId: string) => void;
  adminUpdateDisposalStatus: (logId: string, status: DisposalStatus) => void;
}

const EcoContext = createContext<EcoContextType | null>(null);

const STORAGE_KEY_USERS = 'ecocollect_users_v2';
const STORAGE_KEY_DISPOSALS = 'ecocollect_disposals_v2';
const STORAGE_KEY_TRANSACTIONS = 'ecocollect_transactions_v2';
const STORAGE_KEY_ACTIVE_USER = 'ecocollect_active_user_id_v2';

export const EcoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<ScreenRoute>('home');

  // Load and sanitize users
  const [users, setUsers] = useState<UserEntity[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS);
      let parsed: UserEntity[] = saved ? JSON.parse(saved) : [];

      // Clean out legacy sample names if present
      parsed = parsed.filter(
        (u) =>
          !['Aria Sharma', 'Rohan Mehta', 'Kavita Nair', 'Vikram Joshi', 'Officer Marcus Vance'].includes(u.name)
      );

      // Ensure the canonical admin account exists with admin / admin credentials
      const hasAdmin = parsed.some((u) => u.id === 'admin' || u.username === 'admin');
      if (!hasAdmin) {
        parsed = [...INITIAL_USERS, ...parsed];
      } else {
        // Ensure admin has correct password
        parsed = parsed.map((u) =>
          u.id === 'admin' || u.username === 'admin'
            ? { ...u, username: 'admin', password: 'admin', role: 'admin' as UserRole }
            : u
        );
      }

      return parsed.length > 0 ? parsed : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // Active user state
  const [activeUserId, setActiveUserId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_USER);
      if (saved && saved !== 'null') {
        return saved;
      }
      // If no stored active user, default to null so user can sign in or sign up
      return null;
    } catch {
      return null;
    }
  });

  const [disposals, setDisposals] = useState<DisposalLogEntity[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DISPOSALS);
      return saved ? JSON.parse(saved) : INITIAL_DISPOSALS;
    } catch {
      return INITIAL_DISPOSALS;
    }
  });

  const [transactions, setTransactions] = useState<WalletTransactionEntity[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [binStations] = useState<BinStation[]>(INITIAL_BIN_STATIONS);

  // Draft details for disposal form
  const [draftCategory, setDraftCategory] = useState<string>('Non-Biodegradable');
  const [draftSubCategory, setDraftSubCategory] = useState<string>('PET Plastic (#1)');
  const [draftWeightKg, setDraftWeightKg] = useState<string>('1.5');

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } catch (e) {
      console.warn('Failed to save users', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DISPOSALS, JSON.stringify(disposals));
    } catch (e) {
      console.warn('Failed to save disposals', e);
    }
  }, [disposals]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.warn('Failed to save transactions', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      if (activeUserId) {
        localStorage.setItem(STORAGE_KEY_ACTIVE_USER, activeUserId);
      } else {
        localStorage.removeItem(STORAGE_KEY_ACTIVE_USER);
      }
    } catch (e) {
      console.warn('Failed to save active user', e);
    }
  }, [activeUserId]);

  // Derived current user
  const currentUser = activeUserId ? users.find((u) => u.id === activeUserId) || null : null;
  const isAuthenticated = currentUser !== null;

  // Authentication: Log In
  const login = (usernameOrEmail: string, password: string) => {
    const trimmedIdent = usernameOrEmail.trim().toLowerCase();

    // 1. Check Admin ID & Password as requested: "admin - password: admin"
    if (trimmedIdent === 'admin' && password === 'admin') {
      let adminUser = users.find((u) => u.id === 'admin' || u.username === 'admin');
      if (!adminUser) {
        adminUser = INITIAL_USERS[0];
        setUsers((prev) => [adminUser!, ...prev]);
      }
      setActiveUserId(adminUser.id);
      return { success: true, message: 'Welcome, Municipal Administrator!', user: adminUser };
    }

    // 2. Check registered user credentials
    const foundUser = users.find(
      (u) =>
        (u.username && u.username.toLowerCase() === trimmedIdent) ||
        u.email.toLowerCase() === trimmedIdent ||
        u.id.toLowerCase() === trimmedIdent
    );

    if (!foundUser) {
      return {
        success: false,
        message: 'No registered account found with that username or email. Please sign up.',
      };
    }

    if (foundUser.password && foundUser.password !== password) {
      return {
        success: false,
        message: 'Incorrect password. Please verify and try again.',
      };
    }

    setActiveUserId(foundUser.id);
    return {
      success: true,
      message: `Signed in successfully as ${foundUser.name}!`,
      user: foundUser,
    };
  };

  // Authentication: Sign Up (Register Credentials)
  const signup = ({
    name,
    username,
    email,
    password,
    phone,
    ward,
    upiId,
    avatarId = 'avatar_1',
  }: {
    name: string;
    username: string;
    email: string;
    password: string;
    phone: string;
    ward: string;
    upiId: string;
    avatarId?: string;
  }) => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanUsername || !password || !name.trim()) {
      return { success: false, message: 'Name, Username, and Password are required.' };
    }

    // Check for collision with admin
    if (cleanUsername === 'admin') {
      return { success: false, message: 'Username "admin" is reserved for the municipal controller.' };
    }

    // Check if user already exists
    const existing = users.find(
      (u) =>
        (u.username && u.username.toLowerCase() === cleanUsername) ||
        u.email.toLowerCase() === cleanEmail
    );

    if (existing) {
      return { success: false, message: 'An account with that username or email already exists. Please sign in.' };
    }

    const newUser: UserEntity = {
      id: `usr_${Date.now()}`,
      username: cleanUsername,
      password: password,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim() || '+91 98000 00000',
      role: 'user',
      ward: ward || 'Green Valley Ward 4',
      upiId: upiId.trim() || `${cleanUsername}@upi`,
      pointsBalance: 100, // 100 Welcome Points
      totalKgDisposed: 0,
      avatarId: avatarId,
      createdAt: Date.now(),
    };

    // Add welcome transaction
    const welcomeTx: WalletTransactionEntity = {
      id: `tx_${Date.now()}`,
      userId: newUser.id,
      userName: newUser.name,
      type: 'REWARD_CREDIT',
      pointsDelta: 100,
      cashAmountInr: 10.0,
      status: 'Verified',
      payoutDestination: 'EcoCollect Sign-Up Welcome Bonus',
      referenceNumber: `ECO-WB-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: Date.now(),
    };

    setUsers((prev) => [...prev, newUser]);
    setTransactions((prev) => [welcomeTx, ...prev]);
    setActiveUserId(newUser.id);

    return {
      success: true,
      message: 'Account registered successfully! You received 100 bonus EcoPoints (₹10.00).',
      user: newUser,
    };
  };

  // Authentication: Log Out
  const logout = () => {
    setActiveUserId(null);
    setCurrentRoute('home');
  };

  // Password Management
  const changePassword = (oldPassword: string, newPassword: string) => {
    if (!currentUser) {
      return { success: false, message: 'No authenticated user.' };
    }
    if (currentUser.password && currentUser.password !== oldPassword) {
      return { success: false, message: 'Current password does not match.' };
    }
    if (newPassword.length < 4) {
      return { success: false, message: 'New password must be at least 4 characters.' };
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, password: newPassword } : u))
    );

    return { success: true, message: 'Password updated successfully!' };
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setActiveUserId(userId);
    }
  };

  const setDraftDetails = (cat: string, sub: string, weight: string) => {
    setDraftCategory(cat);
    setDraftSubCategory(sub);
    setDraftWeightKg(weight);
  };

  const submitDisposal = ({
    weightKg,
    binLocation,
    imageProofUri = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80',
    category = draftCategory,
    subCategory = draftSubCategory,
  }: {
    weightKg: number;
    binLocation: string;
    imageProofUri?: string;
    category?: string;
    subCategory?: string;
  }) => {
    const activeUser = currentUser || {
      id: 'guest_citizen',
      name: 'Active Citizen',
      pointsBalance: 0,
      totalKgDisposed: 0,
    };

    const pointsAwarded = Math.max(1, Math.round(weightKg * 100));
    const isSuspicious = weightKg > 15.0;
    const status: DisposalStatus = isSuspicious ? 'Flagged' : 'Verified';

    const newLog: DisposalLogEntity = {
      id: `disp_${Date.now()}`,
      userId: activeUser.id,
      userName: activeUser.name,
      category,
      subCategory,
      weightKg,
      pointsAwarded,
      binLocation,
      status,
      imageProofUri,
      timestamp: Date.now(),
    };

    // Credit user points and kg if logged in
    if (currentUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === currentUser.id
            ? {
                ...u,
                pointsBalance: u.pointsBalance + pointsAwarded,
                totalKgDisposed: Math.round((u.totalKgDisposed + weightKg) * 10) / 10,
              }
            : u
        )
      );

      // Add reward credit transaction
      const newTx: WalletTransactionEntity = {
        id: `tx_${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        type: 'REWARD_CREDIT',
        pointsDelta: pointsAwarded,
        cashAmountInr: pointsAwarded * 0.1,
        status: 'Verified',
        payoutDestination: 'EcoCollect Segregation Reward',
        referenceNumber: `ECO-RW-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: Date.now(),
      };
      setTransactions((prev) => [newTx, ...prev]);
    }

    setDisposals((prev) => [newLog, ...prev]);

    return { log: newLog, pointsAwarded };
  };

  const requestWithdrawal = (
    points: number,
    payoutMethod: 'UPI' | 'Bank Transfer',
    destination: string
  ) => {
    if (!currentUser) {
      return { success: false, message: 'Please sign in to request payouts.' };
    }
    if (points < 250) {
      return { success: false, message: 'Minimum withdrawal threshold is 250 points (₹25.00).' };
    }
    if (currentUser.pointsBalance < points) {
      return {
        success: false,
        message: `Insufficient points balance. You have ${currentUser.pointsBalance} points available.`,
      };
    }

    const cashAmountInr = points * 0.1;
    const txType =
      payoutMethod === 'UPI' ? 'CASH_WITHDRAWAL_UPI' : 'CASH_WITHDRAWAL_BANK';

    const newTx: WalletTransactionEntity = {
      id: `tx_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      type: txType,
      pointsDelta: -points,
      cashAmountInr,
      status: 'Pending',
      payoutDestination: destination,
      referenceNumber: `ECO-WD-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: Date.now(),
    };

    // Deduct points immediately
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? { ...u, pointsBalance: u.pointsBalance - points }
          : u
      )
    );

    setTransactions((prev) => [newTx, ...prev]);

    return {
      success: true,
      message: `Withdrawal request for ₹${cashAmountInr.toFixed(2)} submitted successfully! Reference: ${newTx.referenceNumber}`,
    };
  };

  const updateUserProfile = (params: {
    name: string;
    phone: string;
    upiId: string;
    ward: string;
    avatarId: string;
  }) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              name: params.name.trim() || u.name,
              phone: params.phone.trim() || u.phone,
              upiId: params.upiId.trim() || u.upiId,
              ward: params.ward || u.ward,
              avatarId: params.avatarId || u.avatarId,
            }
          : u
      )
    );
  };

  const adminApprovePayout = (txId: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txId ? { ...t, status: 'Transferred' } : t
      )
    );
  };

  const adminRejectPayout = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx || tx.status !== 'Pending') return;

    // Refund points back to user
    const pointsToRefund = Math.abs(tx.pointsDelta);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === tx.userId
          ? { ...u, pointsBalance: u.pointsBalance + pointsToRefund }
          : u
      )
    );

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txId ? { ...t, status: 'Rejected' } : t
      )
    );
  };

  const adminUpdateDisposalStatus = (logId: string, status: DisposalStatus) => {
    setDisposals((prev) =>
      prev.map((d) => (d.id === logId ? { ...d, status } : d))
    );
  };

  return (
    <EcoContext.Provider
      value={{
        currentRoute,
        setCurrentRoute,
        currentUser,
        isAuthenticated,
        users,
        binStations,
        disposals,
        transactions,
        draftCategory,
        draftSubCategory,
        draftWeightKg,
        setDraftDetails,
        login,
        signup,
        logout,
        changePassword,
        switchUser,
        submitDisposal,
        requestWithdrawal,
        updateUserProfile,
        adminApprovePayout,
        adminRejectPayout,
        adminUpdateDisposalStatus,
      }}
    >
      {children}
    </EcoContext.Provider>
  );
};

export const useEco = () => {
  const context = useContext(EcoContext);
  if (!context) {
    throw new Error('useEco must be used within an EcoProvider');
  }
  return context;
};
