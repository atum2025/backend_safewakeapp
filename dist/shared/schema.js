import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
// Users table
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    fullName: text("full_name").notNull(),
    whatsapp: text("whatsapp").notNull(),
    birthdate: text("birthdate").notNull(),
    country: text("country").notNull().default("Brasil"),
});
export const insertUserSchema = createInsertSchema(users).pick({
    email: true,
    password: true,
    fullName: true,
    whatsapp: true,
    birthdate: true,
    country: true,
});
// Emergency contacts table
export const emergencyContacts = pgTable("emergency_contacts", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    name: text("name").notNull(),
    whatsapp: text("whatsapp").notNull(),
});
export const insertEmergencyContactSchema = createInsertSchema(emergencyContacts).pick({
    userId: true,
    name: true,
    whatsapp: true,
});
// Alarm configurations table
export const alarmConfigs = pgTable("alarm_configs", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    time: text("time").notNull().default("08:00"),
    repeatInterval: integer("repeat_interval").notNull().default(12),
    ringtone: text("ringtone").notNull().default("alarme1"),
    isActive: boolean("is_active").notNull().default(true),
    nextAlarm: timestamp("next_alarm").notNull(),
});
export const insertAlarmConfigSchema = createInsertSchema(alarmConfigs).pick({
    userId: true,
    time: true,
    repeatInterval: true,
    ringtone: true,
    isActive: true,
    nextAlarm: true,
});
//# sourceMappingURL=schema.js.map