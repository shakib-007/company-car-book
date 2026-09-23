import { api, newId } from "./api";

export async function notifyUser(
  userId: string,
  title: string,
  message: string,
  type: string,
  requestId = "",
): Promise<void> {
  await api.createNotification({
    id: newId(),
    userId,
    title,
    message,
    type,
    requestId,
    isRead: false,
    createdAt: new Date().toISOString(),
  });
}

export async function notifyAdmins(
  title: string,
  message: string,
  type: string,
  requestId = "",
): Promise<void> {
  const admins = await api.getUsers({ role: "admin" });
  await Promise.all(
    admins
      .filter((admin) => admin.status === "active")
      .map((admin) => notifyUser(admin.id, title, message, type, requestId)),
  );
}

export async function notifyDriverUser(
  driverId: string | null,
  title: string,
  message: string,
  type: string,
  requestId: string,
): Promise<void> {
  if (!driverId) return;
  const driver = await api.getDriver(driverId);
  if (!driver) return;
  await notifyUser(driver.userId, title, message, type, requestId);
}
