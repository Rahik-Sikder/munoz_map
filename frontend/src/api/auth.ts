// Authentication utilities for admin panel


const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || 'dev-key-123';
const VALID_PASSWORD = import.meta.env.VITE_VALID_PASSWORD || 'munoz123';
const AUTH_STORAGE_KEY = 'adminKey';


export const authUtils = {
  /**
   * Validate password and store admin key if correct
   * @param password The password to validate
   * @returns true if password is correct, false otherwise
   */
  login(password: string): boolean {
    if (password === VALID_PASSWORD) {
      sessionStorage.setItem(AUTH_STORAGE_KEY, ADMIN_KEY);
      return true;
    }
    return false;
  },

  /**
   * Get the stored admin key
   * @returns The admin key or null if not authenticated
   */
  getAdminKey(): string | null {
    return sessionStorage.getItem(AUTH_STORAGE_KEY);
  },

  /**
   * Check if user is authenticated
   * @returns true if authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    return !!this.getAdminKey();
  },

  /**
   * Clear authentication and log out
   */
  logout(): void {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  },
};
