import type {
  Car,
  Driver,
  LocationPoint,
  Notification,
  Rating,
  TripLog,
  TripRequest,
  User,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";

export function newId(): string {
  return crypto.randomUUID();
}

function query(params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) return "";
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API ${res.status} ${init?.method || "GET"} ${path}`);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export const api = {
  getUsers: (params?: Record<string, string>) => http<User[]>(`/users${query(params)}`),
  getUser: (id: string) => http<User>(`/users/${id}`),
  createUser: (data: User) =>
    http<User>("/users", { method: "POST", body: JSON.stringify(data) }),
  updateUser: (id: string, data: Partial<User>) =>
    http<User>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteUser: (id: string) => http<void>(`/users/${id}`, { method: "DELETE" }),

  getDrivers: (params?: Record<string, string>) => http<Driver[]>(`/drivers${query(params)}`),
  getDriver: (id: string) => http<Driver>(`/drivers/${id}`),
  createDriver: (data: Driver) =>
    http<Driver>("/drivers", { method: "POST", body: JSON.stringify(data) }),
  updateDriver: (id: string, data: Partial<Driver>) =>
    http<Driver>(`/drivers/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteDriver: (id: string) => http<void>(`/drivers/${id}`, { method: "DELETE" }),

  getCars: (params?: Record<string, string>) => http<Car[]>(`/cars${query(params)}`),
  getCar: (id: string) => http<Car>(`/cars/${id}`),
  createCar: (data: Car) => http<Car>("/cars", { method: "POST", body: JSON.stringify(data) }),
  updateCar: (id: string, data: Partial<Car>) =>
    http<Car>(`/cars/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteCar: (id: string) => http<void>(`/cars/${id}`, { method: "DELETE" }),

  getTripRequests: (params?: Record<string, string>) =>
    http<TripRequest[]>(`/tripRequests${query(params)}`),
  getTripRequest: (id: string) => http<TripRequest>(`/tripRequests/${id}`),
  createTripRequest: (data: TripRequest) =>
    http<TripRequest>("/tripRequests", { method: "POST", body: JSON.stringify(data) }),
  updateTripRequest: (id: string, data: Partial<TripRequest>) =>
    http<TripRequest>(`/tripRequests/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteTripRequest: (id: string) => http<void>(`/tripRequests/${id}`, { method: "DELETE" }),

  getTripLogs: (params?: Record<string, string>) => http<TripLog[]>(`/tripLogs${query(params)}`),
  createTripLog: (data: TripLog) =>
    http<TripLog>("/tripLogs", { method: "POST", body: JSON.stringify(data) }),
  updateTripLog: (id: string, data: Partial<TripLog>) =>
    http<TripLog>(`/tripLogs/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  getLocations: (params?: Record<string, string>) =>
    http<LocationPoint[]>(`/locations${query(params)}`),
  createLocation: (data: LocationPoint) =>
    http<LocationPoint>("/locations", { method: "POST", body: JSON.stringify(data) }),

  getNotifications: (params?: Record<string, string | boolean>) =>
    http<Notification[]>(`/notifications${query(params)}`),
  createNotification: (data: Notification) =>
    http<Notification>("/notifications", { method: "POST", body: JSON.stringify(data) }),
  updateNotification: (id: string, data: Partial<Notification>) =>
    http<Notification>(`/notifications/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  getRatings: (params?: Record<string, string>) => http<Rating[]>(`/ratings${query(params)}`),
  createRating: (data: Rating) =>
    http<Rating>("/ratings", { method: "POST", body: JSON.stringify(data) }),
};
