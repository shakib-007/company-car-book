import type { Car, Driver, TripRequest, TripStatus } from "./types";

const BLOCKING_STATUSES: TripStatus[] = ["assigned", "accepted", "in_progress"];

export function rangesOverlap(
  newStart: string,
  newEnd: string,
  existingStart: string,
  existingEnd: string,
): boolean {
  return new Date(newStart) < new Date(existingEnd) && new Date(newEnd) > new Date(existingStart);
}

export function datesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);
  while (cursor <= last) {
    const year = cursor.getFullYear();
    const month = String(cursor.getMonth() + 1).padStart(2, "0");
    const day = String(cursor.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function isDriverOnLeave(driver: Driver, start: string, end: string): boolean {
  const needed = datesInRange(start, end);
  return needed.some((date) => driver.onLeaveDates.includes(date));
}

export function getAvailableDrivers(
  drivers: Driver[],
  requests: TripRequest[],
  start: string,
  end: string,
  excludeRequestId?: string,
): Driver[] {
  const busyIds = new Set(
    requests
      .filter(
        (request) =>
          request.id !== excludeRequestId &&
          BLOCKING_STATUSES.includes(request.status) &&
          Boolean(request.driverId) &&
          rangesOverlap(start, end, request.startDateTime, request.endDateTime),
      )
      .map((request) => request.driverId as string),
  );

  return drivers.filter((driver) => !busyIds.has(driver.id) && !isDriverOnLeave(driver, start, end));
}

export function getAvailableCars(
  cars: Car[],
  requests: TripRequest[],
  start: string,
  end: string,
  excludeRequestId?: string,
): Car[] {
  const busyIds = new Set(
    requests
      .filter(
        (request) =>
          request.id !== excludeRequestId &&
          BLOCKING_STATUSES.includes(request.status) &&
          Boolean(request.carId) &&
          rangesOverlap(start, end, request.startDateTime, request.endDateTime),
      )
      .map((request) => request.carId as string),
  );

  return cars.filter((car) => car.status !== "inactive" && !busyIds.has(car.id));
}
