import { 
  users, type User, type InsertUser,
  emergencyContacts, type EmergencyContact, type InsertEmergencyContact,
  alarmConfigs, type AlarmConfig, type InsertAlarmConfig
} from "@shared/schema";

// Storage interface for CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Emergency contact operations
  getEmergencyContact(userId: number): Promise<EmergencyContact | undefined>;
  createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact>;
  updateEmergencyContact(id: number, contactData: Partial<EmergencyContact>): Promise<EmergencyContact | undefined>;
  
  // Alarm config operations
  getAlarmConfig(userId: number): Promise<AlarmConfig | undefined>;
  createAlarmConfig(config: InsertAlarmConfig): Promise<AlarmConfig>;
  updateAlarmConfig(id: number, configData: Partial<AlarmConfig>): Promise<AlarmConfig | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private emergencyContacts: Map<number, EmergencyContact>;
  private alarmConfigs: Map<number, AlarmConfig>;
  private currentUserId: number;
  private currentContactId: number;
  private currentConfigId: number;

  constructor() {
    this.users = new Map();
    this.emergencyContacts = new Map();
    this.alarmConfigs = new Map();
    this.currentUserId = 1;
    this.currentContactId = 1;
    this.currentConfigId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Emergency contact methods
  async getEmergencyContact(userId: number): Promise<EmergencyContact | undefined> {
    return Array.from(this.emergencyContacts.values()).find(
      (contact) => contact.userId === userId,
    );
  }

  async createEmergencyContact(insertContact: InsertEmergencyContact): Promise<EmergencyContact> {
    // First check if user already has a contact and remove it (only one allowed)
    const existingContact = await this.getEmergencyContact(insertContact.userId);
    if (existingContact) {
      this.emergencyContacts.delete(existingContact.id);
    }
    
    const id = this.currentContactId++;
    const contact: EmergencyContact = { ...insertContact, id };
    this.emergencyContacts.set(id, contact);
    return contact;
  }

  async updateEmergencyContact(id: number, contactData: Partial<EmergencyContact>): Promise<EmergencyContact | undefined> {
    const existingContact = this.emergencyContacts.get(id);
    if (!existingContact) return undefined;
    
    const updatedContact = { ...existingContact, ...contactData };
    this.emergencyContacts.set(id, updatedContact);
    return updatedContact;
  }

  // Alarm config methods
  async getAlarmConfig(userId: number): Promise<AlarmConfig | undefined> {
    return Array.from(this.alarmConfigs.values()).find(
      (config) => config.userId === userId,
    );
  }

  async createAlarmConfig(insertConfig: InsertAlarmConfig): Promise<AlarmConfig> {
    // If user already has config, delete it (each user has only one config)
    const existingConfig = await this.getAlarmConfig(insertConfig.userId);
    if (existingConfig) {
      this.alarmConfigs.delete(existingConfig.id);
    }
    
    const id = this.currentConfigId++;
    const config: AlarmConfig = { ...insertConfig, id };
    this.alarmConfigs.set(id, config);
    return config;
  }

  async updateAlarmConfig(id: number, configData: Partial<AlarmConfig>): Promise<AlarmConfig | undefined> {
    const existingConfig = this.alarmConfigs.get(id);
    if (!existingConfig) return undefined;
    
    const updatedConfig = { ...existingConfig, ...configData };
    this.alarmConfigs.set(id, updatedConfig);
    return updatedConfig;
  }
}

export const storage = new MemStorage();
