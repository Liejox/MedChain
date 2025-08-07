export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: "patient" | "doctor" | "admin";
  firstName: string;
  lastName: string;
  profilePicture?: string;
  didIdentifier?: string;
  isVerified: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "patient" | "doctor" | "admin";
  specialty?: string;
  licenseNumber?: string;
}

export const AUTH_TOKEN_KEY = "token";

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function removeAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (!token) {
    return {};
  }
  
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function makeAuthenticatedRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function hasRole(user: AuthUser | null, role: string): boolean {
  return user?.role === role;
}

export function canAccessRoute(user: AuthUser | null, requiredRole?: string): boolean {
  if (!user) return false;
  if (!requiredRole) return true;
  return hasRole(user, requiredRole);
}

export function getRoleDisplayName(role: string): string {
  switch (role) {
    case "patient":
      return "Patient";
    case "doctor":
      return "Doctor";
    case "admin":
      return "Administrator";
    default:
      return role;
  }
}

export function getRoleColor(role: string): string {
  switch (role) {
    case "patient":
      return "bg-healthcare-green/10 text-healthcare-green";
    case "doctor":
      return "bg-medical-blue/10 text-medical-blue";
    case "admin":
      return "bg-digital-purple/10 text-digital-purple";
    default:
      return "bg-gray-100 text-gray-600";
  }
}
