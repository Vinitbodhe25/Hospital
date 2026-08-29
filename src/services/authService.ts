/**
 * Shrushrut — Hospital OPD Dynamic Queue Management System
 * Admin & Staff Authentication Service
 * 
 * Supports extensible role-based access for:
 * - Super Administrators (e.g. ritikpetkar44@gmail.com)
 * - Central OPD Registrars
 * - Chief Medical Officers
 * - Department OPD Doctors & Room Assistants
 */

import { AdminUser, DepartmentId } from '../types';
import { INITIAL_ADMIN_USERS } from '../data/mockData';

class AuthService {
  private static instance: AuthService;
  private users: AdminUser[] = [];
  private currentUser: AdminUser | null = null;
  private listeners: Set<(user: AdminUser | null) => void> = new Set();
  private storageKey = 'shrushrut_auth_session_v1';

  private constructor() {
    this.users = [...INITIAL_ADMIN_USERS];
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.currentUser = JSON.parse(saved);
      }
    } catch {
      this.currentUser = null;
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public onAuthStateChanged(callback: (user: AdminUser | null) => void): () => void {
    this.listeners.add(callback);
    callback(this.currentUser);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public getCurrentUser(): AdminUser | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Verified admin & staff login with password authentication
   * Super Admin: ritikpetkar44@gmail.com / 123456
   */
  public async loginWithEmail(email: string, password?: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your admin email address.' };
    }

    if (!cleanPassword) {
      return { success: false, error: 'Please enter your password (passcode: 123456).' };
    }

    // Check credentials
    if (cleanPassword !== '123456') {
      return { success: false, error: 'Incorrect password. Please enter the valid admin passcode (123456).' };
    }

    // Find registered admin user
    let user = this.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      if (cleanEmail === 'ritikpetkar44@gmail.com') {
        user = {
          id: 'adm-001',
          email: 'ritikpetkar44@gmail.com',
          name: 'Ritik Petkar',
          role: 'SUPER_ADMIN',
          permissions: ['all', 'export_csv', 'emergency_override', 'doctor_management', 'reassign_queue'],
        };
        this.users.unshift(user);
      } else if (cleanEmail.includes('@')) {
        user = {
          id: `adm-${Date.now()}`,
          email: cleanEmail,
          name: cleanEmail.split('@')[0].replace('.', ' ').toUpperCase(),
          role: 'OPD_REGISTRAR',
          permissions: ['bookings', 'arrivals'],
        };
        this.users.push(user);
      } else {
        return { success: false, error: 'Please enter a valid authorized admin email.' };
      }
    }

    this.currentUser = user;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(user));
    } catch (e) {
      console.warn('Could not persist auth token:', e);
    }

    this.listeners.forEach((fn) => fn(this.currentUser));
    return { success: true, user };
  }

  /**
   * Fast-switch doctor login for testing doctor OP panel
   */
  public async loginAsDoctor(doctorId: string, doctorName: string, departmentId: DepartmentId): Promise<AdminUser> {
    const user: AdminUser = {
      id: `doc-usr-${doctorId}`,
      email: `${doctorId}@shrushrut.hospital`,
      name: doctorName,
      role: 'DOCTOR',
      departmentId,
      doctorId,
      permissions: ['consultation_panel'],
    };
    this.currentUser = user;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(user));
    } catch {
      // pass
    }
    this.listeners.forEach((fn) => fn(this.currentUser));
    return user;
  }

  public logout(): void {
    this.currentUser = null;
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // pass
    }
    this.listeners.forEach((fn) => fn(null));
  }

  public getAllAdmins(): AdminUser[] {
    return [...this.users];
  }

  public registerAdmin(user: AdminUser): void {
    if (!this.users.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
      this.users.push(user);
    }
  }
}

export const authService = AuthService.getInstance();
