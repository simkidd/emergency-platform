import { emergencyChannel } from "../utils/ably";

// Notify volunteers about new emergency
export const notifyVolunteers = async (emergency: any, volunteers: any[]) => {
  const message = {
    emergencyId: emergency._id,
    type: emergency.type,
    location: emergency.location.coordinates,
    timestamp: new Date().toISOString(),
    urgency: "high",
  };

  await emergencyChannel.publish("emergency-alert", message);
};

// Notify admin when no volunteers are available
export const notifyAdmin = async (details: any) => {
  await emergencyChannel.publish("admin-alert", {
    ...details,
    severity: "critical",
    actionRequired: true,
  });
};
