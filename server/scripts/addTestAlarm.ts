import { db } from "../db";
import { alarmConfigs } from "../../shared/schema";

await db.insert(alarmConfigs).values({
  userId: 1, // substitua com um ID real
  nextAlarm: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
  repeatInterval: 12,
  alertType: "ringtone",
});

console.log("🔔 Alarme de teste inserido.");
