import { createServer } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertEmergencyContactSchema, insertAlarmConfigSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
export async function registerRoutes(app) {
    // API Routes
    app.post("/api/register", async (req, res) => {
        try {
            const userData = insertUserSchema.parse(req.body);
            // Extract emergency contact data from request
            const emergencyContact = req.body.emergencyContact;
            // Check if email already exists
            const existingUser = await storage.getUserByEmail(userData.email);
            if (existingUser) {
                return res.status(400).json({ message: "Email já cadastrado" });
            }
            const user = await storage.createUser(userData);
            // Initialize a default alarm config for new user
            const defaultConfig = {
                userId: user.id,
                time: "08:00",
                repeatInterval: 12,
                ringtone: "alarme1",
                isActive: true,
                nextAlarm: new Date(),
            };
            await storage.createAlarmConfig(defaultConfig);
            // Create emergency contact if provided
            if (emergencyContact && emergencyContact.name && emergencyContact.whatsapp) {
                await storage.createEmergencyContact({
                    userId: user.id,
                    name: emergencyContact.name,
                    whatsapp: emergencyContact.whatsapp
                });
            }
            // Don't return password
            const { password, ...userWithoutPassword } = user;
            return res.status(201).json(userWithoutPassword);
        }
        catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({ message: fromZodError(error).message });
            }
            return res.status(500).json({ message: "Erro ao criar usuário" });
        }
    });
    app.post("/api/login", async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: "Email e senha são obrigatórios" });
            }
            const user = await storage.getUserByEmail(email);
            if (!user || user.password !== password) {
                return res.status(401).json({ message: "Email ou senha incorretos" });
            }
            // Don't return password
            const { password: _, ...userWithoutPassword } = user;
            return res.json(userWithoutPassword);
        }
        catch (error) {
            return res.status(500).json({ message: "Erro ao realizar login" });
        }
    });
    // Emergency contact routes
    app.post("/api/emergency-contact", async (req, res) => {
        try {
            const contactData = insertEmergencyContactSchema.parse(req.body);
            const contact = await storage.createEmergencyContact(contactData);
            return res.status(201).json(contact);
        }
        catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({ message: fromZodError(error).message });
            }
            return res.status(500).json({ message: "Erro ao criar contato de emergência" });
        }
    });
    app.get("/api/emergency-contact/:userId", async (req, res) => {
        try {
            const userId = parseInt(req.params.userId);
            const contact = await storage.getEmergencyContact(userId);
            if (!contact) {
                return res.status(404).json({ message: "Contato de emergência não encontrado" });
            }
            return res.json(contact);
        }
        catch (error) {
            return res.status(500).json({ message: "Erro ao buscar contato de emergência" });
        }
    });
    app.put("/api/emergency-contact/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const contactData = req.body;
            const updatedContact = await storage.updateEmergencyContact(id, contactData);
            if (!updatedContact) {
                return res.status(404).json({ message: "Contato de emergência não encontrado" });
            }
            return res.json(updatedContact);
        }
        catch (error) {
            return res.status(500).json({ message: "Erro ao atualizar contato de emergência" });
        }
    });
    // Alarm config routes
    app.post("/api/alarm-config", async (req, res) => {
        try {
            const configData = insertAlarmConfigSchema.parse(req.body);
            const config = await storage.createAlarmConfig(configData);
            return res.status(201).json(config);
        }
        catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({ message: fromZodError(error).message });
            }
            return res.status(500).json({ message: "Erro ao criar configuração de alarme" });
        }
    });
    app.get("/api/alarm-config/:userId", async (req, res) => {
        try {
            const userId = parseInt(req.params.userId);
            const config = await storage.getAlarmConfig(userId);
            if (!config) {
                return res.status(404).json({ message: "Configuração de alarme não encontrada" });
            }
            return res.json(config);
        }
        catch (error) {
            return res.status(500).json({ message: "Erro ao buscar configuração de alarme" });
        }
    });
    app.put("/api/alarm-config/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const configData = req.body;
            const updatedConfig = await storage.updateAlarmConfig(id, configData);
            if (!updatedConfig) {
                return res.status(404).json({ message: "Configuração de alarme não encontrada" });
            }
            return res.json(updatedConfig);
        }
        catch (error) {
            return res.status(500).json({ message: "Erro ao atualizar configuração de alarme" });
        }
    });
    // User routes
    app.get("/api/user/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const user = await storage.getUser(id);
            if (!user) {
                return res.status(404).json({ message: "Usuário não encontrado" });
            }
            // Don't return password
            const { password, ...userWithoutPassword } = user;
            return res.json(userWithoutPassword);
        }
        catch (error) {
            return res.status(500).json({ message: "Erro ao buscar usuário" });
        }
    });
    app.put("/api/user/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const userData = req.body;
            const updatedUser = await storage.updateUser(id, userData);
            if (!updatedUser) {
                return res.status(404).json({ message: "Usuário não encontrado" });
            }
            // Don't return password
            const { password, ...userWithoutPassword } = updatedUser;
            return res.json(userWithoutPassword);
        }
        catch (error) {
            return res.status(500).json({ message: "Erro ao atualizar usuário" });
        }
    });
    // WhatsApp message route (in real implementation would integrate with WhatsApp Business API)
    app.post("/api/send-emergency", async (req, res) => {
        try {
            const { userId } = req.body;
            if (!userId) {
                return res.status(400).json({ message: "ID do usuário é obrigatório" });
            }
            // Get user and emergency contact
            const user = await storage.getUser(parseInt(userId));
            const contact = await storage.getEmergencyContact(parseInt(userId));
            if (!user || !contact) {
                return res.status(404).json({
                    message: !user ? "Usuário não encontrado" : "Contato de emergência não encontrado"
                });
            }
            // In a real implementation, this would send a WhatsApp message
            // For now, we'll just simulate success
            return res.json({
                success: true,
                message: `Mensagem de emergência enviada para ${contact.name} em ${contact.whatsapp}`
            });
        }
        catch (error) {
            return res.status(500).json({ message: "Erro ao enviar mensagem de emergência" });
        }
    });
    const httpServer = createServer(app);
    return httpServer;
}
//# sourceMappingURL=routes.js.map