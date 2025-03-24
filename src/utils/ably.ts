import Ably from "ably";
import { environments } from "../config/environments";

const { ABLY_API_KEY } = environments;

const ably = new Ably.Realtime(ABLY_API_KEY);
ably.connection.once("connected", () => {
  console.log("Connected to Ably!");
});

export const emergencyChannel = ably.channels.get("emergencies");

export default ably;
