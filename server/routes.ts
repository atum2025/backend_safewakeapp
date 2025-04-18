import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { insertUserSchema, insertEmergencyContactSchema, insertAlarmConfigSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<void> {
  // Registro
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const emergencyContact = req.body.emergencyContact;

      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) return res.status(400).json({ message: "Email já cadastrado" });

      const user = await storage.createUser(userData);

      const defaultConfig = {
        userId: user.id,
        time: "08:00",
        repeatInterval: 12,
        ringtone: "alarme1",
        isActive: true,
        nextAlarm: new Date(),
      };
      await storage.createAlarmConfig(defaultConfig);

      if (emergencyContact?.name && emergencyContact?.whatsapp) {
        await storage.createEmergencyContact({
          userId: user.id,
          name: emergencyContact.name,
          whatsapp: emergencyContact.whatsapp,
        });
      }

      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Erro ao criar usuário" });
    }
  });

  // Login
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ message: "Email e senha são obrigatórios" });

      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password)
        return res.status(401).json({ message: "Email ou senha incorretos" });

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch {
      res.status(500).json({ message: "Erro ao realizar login" });
    }
  });

  // Contato emergência
  app.post("/api/emergency-contact", async (req: Request, res: Response) => {
    try {
      const contactData = insertEmergencyContactSchema.parse(req.body);
      const contact = await storage.createEmergencyContact(contactData);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof ZodError)
        return res.status(400).json({ message: fromZodError(error).message });
      res.status(500).json({ message: "Erro ao criar contato de emergência" });
    }
  });

  app.get("/api/emergency-contact/:userId", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      if (isNaN(userId)) return res.status(400).json({ message: "ID inválido" });

      const contact = await storage.getEmergencyContact(userId);
      if (!contact) return res.status(404).json({ message: "Contato de emergência não encontrado" });

      res.json(contact);
    } catch {
      res.status(500).json({ message: "Erro ao buscar contato de emergência" });
    }
  });

  app.put("/api/emergency-contact/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

      const updated = await storage.updateEmergencyContact(id, req.body);
      if (!updated) return res.status(404).json({ message: "Contato de emergência não encontrado" });

      res.json(updated);
    } catch {
      res.status(500).json({ message: "Erro ao atualizar contato de emergência" });
    }
  });

  // Config de alarme
app.post("/api/alarm-config", async (req: Request, res: Response) => {
  try {
    if (typeof req.body.nextAlarm === "string") {
      req.body.nextAlarm = new Date(req.body.nextAlarm);
    }

    const configData = insertAlarmConfigSchema.parse(req.body);
    const config = await storage.createAlarmConfig(configData);
    res.status(201).json(config);
  } catch (error) {
    if (error instanceof ZodError)
      return res.status(400).json({ message: fromZodError(error).message });
    res.status(500).json({ message: "Erro ao criar configuração de alarme" });
  }
});


  app.get("/api/alarm-config/:userId", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      if (isNaN(userId)) return res.status(400).json({ message: "ID inválido" });

      const config = await storage.getAlarmConfig(userId);
      if (!config) return res.status(404).json({ message: "Configuração de alarme não encontrada" });

      res.json(config);
    } catch {
      res.status(500).json({ message: "Erro ao buscar configuração de alarme" });
    }
  });

  app.put("/api/alarm-config/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

      const updated = await storage.updateAlarmConfig(id, req.body);
      if (!updated) return res.status(404).json({ message: "Configuração de alarme não encontrada" });

      res.json(updated);
    } catch {
      res.status(500).json({ message: "Erro ao atualizar configuração de alarme" });
    }
  });

  // Usuário
  app.get("/api/user/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

      const user = await storage.getUser(id);
      if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch {
      res.status(500).json({ message: "Erro ao buscar usuário" });
    }
  });

  app.put("/api/user/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

      const updated = await storage.updateUser(id, req.body);
      if (!updated) return res.status(404).json({ message: "Usuário não encontrado" });

      const { password, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch {
      res.status(500).json({ message: "Erro ao atualizar usuário" });
    }
  });

  // Emergência WhatsApp
  app.post("/api/send-emergency", async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      const uid = Number(userId);
      if (!uid || isNaN(uid)) return res.status(400).json({ message: "ID do usuário é obrigatório e válido" });

      const user = await storage.getUser(uid);
      const contact = await storage.getEmergencyContact(uid);

      if (!user || !contact)
        return res.status(404).json({ message: !user ? "Usuário não encontrado" : "Contato de emergência não encontrado" });

      res.json({
        success: true,
        message: `Mensagem de emergência enviada para ${contact.name} em ${contact.whatsapp}`,
      });
    } catch {
      res.status(500).json({ message: "Erro ao enviar mensagem de emergência" });
    }
  });
}