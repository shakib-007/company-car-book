"use client";

import type { Driver, TripRequest, User } from "@/lib/types";
import { formatDateTime } from "@/lib/datetime";

const START_HOUR = 6;
const END_HOUR = 22;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

function formatHourLabel(hour: number): string {
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12} ${suffix}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function TimelineView({
  date,
  drivers,
  users,
  requests,
}: {
  date: string;
  drivers: Driver[];
  users: User[];
  requests: TripRequest[];
}) {
  const dayRequests = requests.filter((request) => {
    if (["rejected", "cancelled"].includes(request.status) || !request.driverId) return false;
    const start = request.startDateTime.slice(0, 10);
    const end = request.endDateTime.slice(0, 10);
    return start <= date && end >= date;
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <div className="min-w-[900px]">
        <div className="timeline-row border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
          <div className="px-3 py-2 font-medium">Driver</div>
          {HOURS.map((hour) => (
            <div key={hour} className="border-l border-slate-200 px-2 py-2">
              {formatHourLabel(hour)}
            </div>
          ))}
        </div>
        {drivers.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500">No drivers to show.</p>
        ) : (
          drivers.map((driver) => {
            const name = users.find((user) => user.id === driver.userId)?.name || driver.id;
            const onLeave = driver.onLeaveDates.includes(date);
            const bookings = dayRequests.filter((request) => request.driverId === driver.id);
            return (
              <div key={driver.id} className="timeline-row relative min-h-[64px] border-b border-slate-100">
                <div className="px-3 py-3 text-sm">
                  <p className="font-medium text-slate-800">{name}</p>
                  {onLeave ? <p className="text-xs text-amber-700">On leave</p> : null}
                </div>
                <div className="timeline-track">
                  <div className="timeline-hours">
                    {HOURS.map((hour) => (
                      <div key={hour} className="min-h-[64px] border-l border-slate-100" />
                    ))}
                  </div>
                  <div className="timeline-hours pointer-events-none absolute inset-0 py-1">
                    {bookings.map((booking) => {
                      const startHour = clamp(
                        new Date(booking.startDateTime).getHours(),
                        START_HOUR,
                        END_HOUR - 1,
                      );
                      const endHour = clamp(
                        Math.max(new Date(booking.endDateTime).getHours(), startHour + 1),
                        START_HOUR + 1,
                        END_HOUR,
                      );
                      const startIndex = startHour - START_HOUR + 1;
                      const span = clamp(endHour - startHour, 1, 16);
                      const color = booking.status === "in_progress" ? "bg-teal-600" : "bg-sky-600";
                      return (
                        <div
                          key={booking.id}
                          className={`tl-s${startIndex} tl-w${span} pointer-events-auto mx-1 overflow-hidden rounded-md px-2 py-1 text-[11px] text-white ${color}`}
                          title={`${booking.pickup} to ${booking.destination} (${formatDateTime(booking.startDateTime)})`}
                        >
                          {booking.pickup} → {booking.destination}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
