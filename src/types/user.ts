export enum UserRole {
  ADMIN = "ADMIN",
  STAFF = "STAFF",
  CUSTOMER = "CUSTOMER",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
  lastLogin?: Date;
  avatar?: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
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
