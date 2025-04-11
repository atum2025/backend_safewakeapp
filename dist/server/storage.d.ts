import { type User, type InsertUser, type EmergencyContact, type InsertEmergencyContact, type AlarmConfig, type InsertAlarmConfig } from "@shared/schema";
export interface IStorage {
    getUser(id: number): Promise<User | undefined>;
    getUserByEmail(email: string): Promise<User | undefined>;
    createUser(user: InsertUser): Promise<User>;
    updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
    getEmergencyContact(userId: number): Promise<EmergencyContact | undefined>;
    createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact>;
    updateEmergencyContact(id: number, contactData: Partial<EmergencyContact>): Promise<EmergencyContact | undefined>;
    getAlarmConfig(userId: number): Promise<AlarmConfig | undefined>;
    createAlarmConfig(config: InsertAlarmConfig): Promise<AlarmConfig>;
    updateAlarmConfig(id: number, configData: Partial<AlarmConfig>): Promise<AlarmConfig | undefined>;
}
export declare class MemStorage implements IStorage {
    private users;
    private emergencyContacts;
    private alarmConfigs;
    private currentUserId;
    private currentContactId;
    private currentConfigId;
    constructor();
    getUser(id: number): Promise<User | undefined>;
    getUserByEmail(email: string): Promise<User | undefined>;
    createUser(insertUser: InsertUser): Promise<User>;
    updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
    getEmergencyContact(userId: number): Promise<EmergencyContact | undefined>;
    createEmergencyContact(insertContact: InsertEmergencyContact): Promise<EmergencyContact>;
    updateEmergencyContact(id: number, contactData: Partial<EmergencyContact>): Promise<EmergencyContact | undefined>;
    getAlarmConfig(userId: number): Promise<AlarmConfig | undefined>;
    createAlarmConfig(insertConfig: InsertAlarmConfig): Promise<AlarmConfig>;
    updateAlarmConfig(id: number, configData: Partial<AlarmConfig>): Promise<AlarmConfig | undefined>;
}
export declare const storage: MemStorage;
