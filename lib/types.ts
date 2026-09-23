export type Role = "admin" | "employee" | "driver";
export type UserStatus = "pending" | "active" | "inactive";
export type CarStatus = "available" | "on_trip" | "inactive";
export type TripType = "one_way" | "round_trip";
export type Priority = "normal" | "urgent";
export type TripStatus =
  | "pending"
  | "assigned"
  | "accepted"
  | "in_progress"
  | "completed"
  | "rejected"
  | "cancelled";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
  department: string;
  status: UserStatus;
}

export interface Driver {
  id: string;
  userId: string;
  phone: string;
  licenseNumber: string;
  carId: string;
  onLeaveDates: string[];
}

export interface Car {
  id: string;
  model: string;
  plateNumber: string;
  capacity: number;
  fuelType: string;
  status: CarStatus;
}

export interface TripRequest {
  id: string;
  employeeId: string;
  pickup: string;
  destination: string;
  startDateTime: string;
  endDateTime: string;
  tripType: TripType;
  passengers: number;
  reason: string;
  priority: Priority;
  status: TripStatus;
  driverId: string | null;
  carId: string | null;
  adminNote: string;
  driverDeclineReason: string;
  createdAt: string;
}

export interface TripLog {
  id: string;
  requestId: string;
  startedAt: string;
  endedAt: string;
  startOdometer: number;
  endOdometer: number;
}

export interface LocationPoint {
  id: string;
  requestId: string;
  lat: number;
  lng: number;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  requestId: string;
  isRead: boolean;
  createdAt: string;
}

export interface Rating {
  id: string;
  requestId: string;
  driverId: string;
  rating: number;
  comment: string;
}

export interface Session {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface NavItem {
  href: string;
  label: string;
}
