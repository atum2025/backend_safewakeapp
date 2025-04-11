export class MemStorage {
    constructor() {
        this.users = new Map();
        this.emergencyContacts = new Map();
        this.alarmConfigs = new Map();
        this.currentUserId = 1;
        this.currentContactId = 1;
        this.currentConfigId = 1;
    }
    // User methods
    async getUser(id) {
        return this.users.get(id);
    }
    async getUserByEmail(email) {
        return Array.from(this.users.values()).find((user) => user.email.toLowerCase() === email.toLowerCase());
    }
    async createUser(insertUser) {
        const id = this.currentUserId++;
        const user = { ...insertUser, id };
        this.users.set(id, user);
        return user;
    }
    async updateUser(id, userData) {
        const existingUser = this.users.get(id);
        if (!existingUser)
            return undefined;
        const updatedUser = { ...existingUser, ...userData };
        this.users.set(id, updatedUser);
        return updatedUser;
    }
    // Emergency contact methods
    async getEmergencyContact(userId) {
        return Array.from(this.emergencyContacts.values()).find((contact) => contact.userId === userId);
    }
    async createEmergencyContact(insertContact) {
        // First check if user already has a contact and remove it (only one allowed)
        const existingContact = await this.getEmergencyContact(insertContact.userId);
        if (existingContact) {
            this.emergencyContacts.delete(existingContact.id);
        }
        const id = this.currentContactId++;
        const contact = { ...insertContact, id };
        this.emergencyContacts.set(id, contact);
        return contact;
    }
    async updateEmergencyContact(id, contactData) {
        const existingContact = this.emergencyContacts.get(id);
        if (!existingContact)
            return undefined;
        const updatedContact = { ...existingContact, ...contactData };
        this.emergencyContacts.set(id, updatedContact);
        return updatedContact;
    }
    // Alarm config methods
    async getAlarmConfig(userId) {
        return Array.from(this.alarmConfigs.values()).find((config) => config.userId === userId);
    }
    async createAlarmConfig(insertConfig) {
        // If user already has config, delete it (each user has only one config)
        const existingConfig = await this.getAlarmConfig(insertConfig.userId);
        if (existingConfig) {
            this.alarmConfigs.delete(existingConfig.id);
        }
        const id = this.currentConfigId++;
        const config = { ...insertConfig, id };
        this.alarmConfigs.set(id, config);
        return config;
    }
    async updateAlarmConfig(id, configData) {
        const existingConfig = this.alarmConfigs.get(id);
        if (!existingConfig)
            return undefined;
        const updatedConfig = { ...existingConfig, ...configData };
        this.alarmConfigs.set(id, updatedConfig);
        return updatedConfig;
    }
}
export const storage = new MemStorage();
//# sourceMappingURL=storage.js.map