import type { NavItem, TripStatus } from "./types";

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/map", label: "Live map" },
  { href: "/admin/cars", label: "Cars" },
  { href: "/admin/drivers", label: "Drivers" },
  { href: "/admin/registrations", label: "Registrations" },
];

export const EMPLOYEE_NAV: NavItem[] = [
  { href: "/employee/requests", label: "My requests" },
  { href: "/employee/requests/new", label: "New request" },
];

export const DRIVER_NAV: NavItem[] = [{ href: "/driver/trips", label: "My trips" }];

export const TRIP_STATUSES: TripStatus[] = [
  "pending",
  "assigned",
  "accepted",
  "in_progress",
  "completed",
  "rejected",
  "cancelled",
];

export const FUEL_TYPES = ["petrol", "diesel", "hybrid", "electric"];
