export type UserRole = "ADMIN" | "MANAGER" | "VIEWER";

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface Branch {
  id: number;
  name: string;
  description?: string;
  _count?: {
    members: number;
    transactions: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Member {
  id: number;
  name: string;
  description?: string;
  branchId: number;
  branch?: Branch;
  createdAt?: string;
  updatedAt?: string;
}

export interface Event {
  id: number;
  name: string;
  date: string;
  budget: number;
  transactions?: Transaction[];
  rounds?: PaymentRound[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentRound {
  id: number;
  name: string;
  eventId: number;
  event?: Event;
  transactions?: Transaction[];
  createdAt?: string;
  updatedAt?: string;
}

export type TransactionType = "INCOME" | "EXPENSE";

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  memberId?: number | null;
  member?: Member;
  branchId?: number | null;
  branch?: Branch;
  eventId?: number | null;
  event?: Event;
  paymentRoundId?: number | null;
  paymentRound?: PaymentRound;
  createdAt?: string;
  updatedAt?: string;
}
