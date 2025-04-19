import "dotenv/config";
import { db } from "../db";
import { alarmConfigs } from "../../shared/schema";

async function debugAlarms() {
  const alarms = await db.select().from(alarmConfigs);
  console.log("📊 Alarmes encontrados:");
  console.log(alarms);
}

debugAlarms();
