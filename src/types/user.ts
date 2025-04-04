export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface TableBooking {
  id: string;
  userId: string;
  date: string;
  time: string;
  numberOfPeople: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}
