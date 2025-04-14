// server/index.ts
import "dotenv/config";
import express from "express";

// server/storage.ts
var MemStorage = class {
  users;
  emergencyContacts;
  alarmConfigs;
  currentUserId;
  currentContactId;
  currentConfigId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.emergencyContacts = /* @__PURE__ */ new Map();
    this.alarmConfigs = /* @__PURE__ */ new Map();
    this.currentUserId = 1;
    this.currentContactId = 1;
    this.currentConfigId = 1;
  }
  // User methods
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
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
      return void 0;
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  // Emergency contact methods
  async getEmergencyContact(userId) {
    return Array.from(this.emergencyContacts.values()).find(
      (contact) => contact.userId === userId
    );
  }
  async createEmergencyContact(insertContact) {
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
      return void 0;
    const updatedContact = { ...existingContact, ...contactData };
    this.emergencyContacts.set(id, updatedContact);
    return updatedContact;
  }
  // Alarm config methods
  async getAlarmConfig(userId) {
    return Array.from(this.alarmConfigs.values()).find(
      (config) => config.userId === userId
    );
  }
  async createAlarmConfig(insertConfig) {
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
      return void 0;
    const updatedConfig = { ...existingConfig, ...configData };
    this.alarmConfigs.set(id, updatedConfig);
    return updatedConfig;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";

// node_modules/drizzle-zod/index.mjs
import { z } from "zod";
import { isTable, getTableColumns, getViewSelectedFields, is, Column, SQL, isView } from "drizzle-orm";
var CONSTANTS = {
  INT8_MIN: -128,
  INT8_MAX: 127,
  INT8_UNSIGNED_MAX: 255,
  INT16_MIN: -32768,
  INT16_MAX: 32767,
  INT16_UNSIGNED_MAX: 65535,
  INT24_MIN: -8388608,
  INT24_MAX: 8388607,
  INT24_UNSIGNED_MAX: 16777215,
  INT32_MIN: -2147483648,
  INT32_MAX: 2147483647,
  INT32_UNSIGNED_MAX: 4294967295,
  INT48_MIN: -140737488355328,
  INT48_MAX: 140737488355327,
  INT48_UNSIGNED_MAX: 281474976710655,
  INT64_MIN: -9223372036854775808n,
  INT64_MAX: 9223372036854775807n,
  INT64_UNSIGNED_MAX: 18446744073709551615n
};
function isColumnType(column, columnTypes) {
  return columnTypes.includes(column.columnType);
}
function isWithEnum(column) {
  return "enumValues" in column && Array.isArray(column.enumValues) && column.enumValues.length > 0;
}
var literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
var jsonSchema = z.union([literalSchema, z.record(z.any()), z.array(z.any())]);
var bufferSchema = z.custom((v) => v instanceof Buffer);
function columnToSchema(column, factory) {
  const z$1 = factory?.zodInstance ?? z;
  const coerce = factory?.coerce ?? {};
  let schema;
  if (isWithEnum(column)) {
    schema = column.enumValues.length ? z$1.enum(column.enumValues) : z$1.string();
  }
  if (!schema) {
    if (isColumnType(column, ["PgGeometry", "PgPointTuple"])) {
      schema = z$1.tuple([z$1.number(), z$1.number()]);
    } else if (isColumnType(column, ["PgGeometryObject", "PgPointObject"])) {
      schema = z$1.object({ x: z$1.number(), y: z$1.number() });
    } else if (isColumnType(column, ["PgHalfVector", "PgVector"])) {
      schema = z$1.array(z$1.number());
      schema = column.dimensions ? schema.length(column.dimensions) : schema;
    } else if (isColumnType(column, ["PgLine"])) {
      schema = z$1.tuple([z$1.number(), z$1.number(), z$1.number()]);
    } else if (isColumnType(column, ["PgLineABC"])) {
      schema = z$1.object({
        a: z$1.number(),
        b: z$1.number(),
        c: z$1.number()
      });
    } else if (isColumnType(column, ["PgArray"])) {
      schema = z$1.array(columnToSchema(column.baseColumn, z$1));
      schema = column.size ? schema.length(column.size) : schema;
    } else if (column.dataType === "array") {
      schema = z$1.array(z$1.any());
    } else if (column.dataType === "number") {
      schema = numberColumnToSchema(column, z$1, coerce);
    } else if (column.dataType === "bigint") {
      schema = bigintColumnToSchema(column, z$1, coerce);
    } else if (column.dataType === "boolean") {
      schema = coerce === true || coerce.boolean ? z$1.coerce.boolean() : z$1.boolean();
    } else if (column.dataType === "date") {
      schema = coerce === true || coerce.date ? z$1.coerce.date() : z$1.date();
    } else if (column.dataType === "string") {
      schema = stringColumnToSchema(column, z$1, coerce);
    } else if (column.dataType === "json") {
      schema = jsonSchema;
    } else if (column.dataType === "custom") {
      schema = z$1.any();
    } else if (column.dataType === "buffer") {
      schema = bufferSchema;
    }
  }
  if (!schema) {
    schema = z$1.any();
  }
  return schema;
}
function numberColumnToSchema(column, z2, coerce) {
  let unsigned = column.getSQLType().includes("unsigned");
  let min;
  let max;
  let integer2 = false;
  if (isColumnType(column, ["MySqlTinyInt", "SingleStoreTinyInt"])) {
    min = unsigned ? 0 : CONSTANTS.INT8_MIN;
    max = unsigned ? CONSTANTS.INT8_UNSIGNED_MAX : CONSTANTS.INT8_MAX;
    integer2 = true;
  } else if (isColumnType(column, [
    "PgSmallInt",
    "PgSmallSerial",
    "MySqlSmallInt",
    "SingleStoreSmallInt"
  ])) {
    min = unsigned ? 0 : CONSTANTS.INT16_MIN;
    max = unsigned ? CONSTANTS.INT16_UNSIGNED_MAX : CONSTANTS.INT16_MAX;
    integer2 = true;
  } else if (isColumnType(column, [
    "PgReal",
    "MySqlFloat",
    "MySqlMediumInt",
    "SingleStoreMediumInt",
    "SingleStoreFloat"
  ])) {
    min = unsigned ? 0 : CONSTANTS.INT24_MIN;
    max = unsigned ? CONSTANTS.INT24_UNSIGNED_MAX : CONSTANTS.INT24_MAX;
    integer2 = isColumnType(column, ["MySqlMediumInt", "SingleStoreMediumInt"]);
  } else if (isColumnType(column, [
    "PgInteger",
    "PgSerial",
    "MySqlInt",
    "SingleStoreInt"
  ])) {
    min = unsigned ? 0 : CONSTANTS.INT32_MIN;
    max = unsigned ? CONSTANTS.INT32_UNSIGNED_MAX : CONSTANTS.INT32_MAX;
    integer2 = true;
  } else if (isColumnType(column, [
    "PgDoublePrecision",
    "MySqlReal",
    "MySqlDouble",
    "SingleStoreReal",
    "SingleStoreDouble",
    "SQLiteReal"
  ])) {
    min = unsigned ? 0 : CONSTANTS.INT48_MIN;
    max = unsigned ? CONSTANTS.INT48_UNSIGNED_MAX : CONSTANTS.INT48_MAX;
  } else if (isColumnType(column, [
    "PgBigInt53",
    "PgBigSerial53",
    "MySqlBigInt53",
    "MySqlSerial",
    "SingleStoreBigInt53",
    "SingleStoreSerial",
    "SQLiteInteger"
  ])) {
    unsigned = unsigned || isColumnType(column, ["MySqlSerial", "SingleStoreSerial"]);
    min = unsigned ? 0 : Number.MIN_SAFE_INTEGER;
    max = Number.MAX_SAFE_INTEGER;
    integer2 = true;
  } else if (isColumnType(column, ["MySqlYear", "SingleStoreYear"])) {
    min = 1901;
    max = 2155;
    integer2 = true;
  } else {
    min = Number.MIN_SAFE_INTEGER;
    max = Number.MAX_SAFE_INTEGER;
  }
  let schema = coerce === true || coerce?.number ? z2.coerce.number() : z2.number();
  schema = schema.min(min).max(max);
  return integer2 ? schema.int() : schema;
}
function bigintColumnToSchema(column, z2, coerce) {
  const unsigned = column.getSQLType().includes("unsigned");
  const min = unsigned ? 0n : CONSTANTS.INT64_MIN;
  const max = unsigned ? CONSTANTS.INT64_UNSIGNED_MAX : CONSTANTS.INT64_MAX;
  const schema = coerce === true || coerce?.bigint ? z2.coerce.bigint() : z2.bigint();
  return schema.min(min).max(max);
}
function stringColumnToSchema(column, z2, coerce) {
  if (isColumnType(column, ["PgUUID"])) {
    return z2.string().uuid();
  }
  let max;
  let regex;
  let fixed = false;
  if (isColumnType(column, ["PgVarchar", "SQLiteText"])) {
    max = column.length;
  } else if (isColumnType(column, ["MySqlVarChar", "SingleStoreVarChar"])) {
    max = column.length ?? CONSTANTS.INT16_UNSIGNED_MAX;
  } else if (isColumnType(column, ["MySqlText", "SingleStoreText"])) {
    if (column.textType === "longtext") {
      max = CONSTANTS.INT32_UNSIGNED_MAX;
    } else if (column.textType === "mediumtext") {
      max = CONSTANTS.INT24_UNSIGNED_MAX;
    } else if (column.textType === "text") {
      max = CONSTANTS.INT16_UNSIGNED_MAX;
    } else {
      max = CONSTANTS.INT8_UNSIGNED_MAX;
    }
  }
  if (isColumnType(column, [
    "PgChar",
    "MySqlChar",
    "SingleStoreChar"
  ])) {
    max = column.length;
    fixed = true;
  }
  if (isColumnType(column, ["PgBinaryVector"])) {
    regex = /^[01]+$/;
    max = column.dimensions;
  }
  let schema = coerce === true || coerce?.string ? z2.coerce.string() : z2.string();
  schema = regex ? schema.regex(regex) : schema;
  return max && fixed ? schema.length(max) : max ? schema.max(max) : schema;
}
function getColumns(tableLike) {
  return isTable(tableLike) ? getTableColumns(tableLike) : getViewSelectedFields(tableLike);
}
function handleColumns(columns, refinements, conditions, factory) {
  const columnSchemas = {};
  for (const [key, selected] of Object.entries(columns)) {
    if (!is(selected, Column) && !is(selected, SQL) && !is(selected, SQL.Aliased) && typeof selected === "object") {
      const columns2 = isTable(selected) || isView(selected) ? getColumns(selected) : selected;
      columnSchemas[key] = handleColumns(columns2, refinements[key] ?? {}, conditions, factory);
      continue;
    }
    const refinement = refinements[key];
    if (refinement !== void 0 && typeof refinement !== "function") {
      columnSchemas[key] = refinement;
      continue;
    }
    const column = is(selected, Column) ? selected : void 0;
    const schema = column ? columnToSchema(column, factory) : z.any();
    const refined = typeof refinement === "function" ? refinement(schema) : schema;
    if (conditions.never(column)) {
      continue;
    } else {
      columnSchemas[key] = refined;
    }
    if (column) {
      if (conditions.nullable(column)) {
        columnSchemas[key] = columnSchemas[key].nullable();
      }
      if (conditions.optional(column)) {
        columnSchemas[key] = columnSchemas[key].optional();
      }
    }
  }
  return z.object(columnSchemas);
}
var insertConditions = {
  never: (column) => column?.generated?.type === "always" || column?.generatedIdentity?.type === "always",
  optional: (column) => !column.notNull || column.notNull && column.hasDefault,
  nullable: (column) => !column.notNull
};
var createInsertSchema = (entity, refine) => {
  const columns = getColumns(entity);
  return handleColumns(columns, refine ?? {}, insertConditions);
};

// shared/schema.ts
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  whatsapp: text("whatsapp").notNull(),
  birthdate: text("birthdate").notNull(),
  country: text("country").notNull().default("Brasil")
});
var insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  fullName: true,
  whatsapp: true,
  birthdate: true,
  country: true
});
var emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  whatsapp: text("whatsapp").notNull()
});
var insertEmergencyContactSchema = createInsertSchema(emergencyContacts).pick({
  userId: true,
  name: true,
  whatsapp: true
});
var alarmConfigs = pgTable("alarm_configs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  time: text("time").notNull().default("08:00"),
  repeatInterval: integer("repeat_interval").notNull().default(12),
  ringtone: text("ringtone").notNull().default("alarme1"),
  isActive: boolean("is_active").notNull().default(true),
  nextAlarm: timestamp("next_alarm").notNull()
});
var insertAlarmConfigSchema = createInsertSchema(alarmConfigs).pick({
  userId: true,
  time: true,
  repeatInterval: true,
  ringtone: true,
  isActive: true,
  nextAlarm: true
});

// server/routes.ts
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
async function registerRoutes(app2) {
  app2.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const emergencyContact = req.body.emergencyContact;
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser)
        return res.status(400).json({ message: "Email j\xE1 cadastrado" });
      const user = await storage.createUser(userData);
      const defaultConfig = {
        userId: user.id,
        time: "08:00",
        repeatInterval: 12,
        ringtone: "alarme1",
        isActive: true,
        nextAlarm: /* @__PURE__ */ new Date()
      };
      await storage.createAlarmConfig(defaultConfig);
      if (emergencyContact?.name && emergencyContact?.whatsapp) {
        await storage.createEmergencyContact({
          userId: user.id,
          name: emergencyContact.name,
          whatsapp: emergencyContact.whatsapp
        });
      }
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Erro ao criar usu\xE1rio" });
    }
  });
  app2.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ message: "Email e senha s\xE3o obrigat\xF3rios" });
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password)
        return res.status(401).json({ message: "Email ou senha incorretos" });
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch {
      res.status(500).json({ message: "Erro ao realizar login" });
    }
  });
  app2.post("/api/emergency-contact", async (req, res) => {
    try {
      const contactData = insertEmergencyContactSchema.parse(req.body);
      const contact = await storage.createEmergencyContact(contactData);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof ZodError)
        return res.status(400).json({ message: fromZodError(error).message });
      res.status(500).json({ message: "Erro ao criar contato de emerg\xEAncia" });
    }
  });
  app2.get("/api/emergency-contact/:userId", async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      if (isNaN(userId))
        return res.status(400).json({ message: "ID inv\xE1lido" });
      const contact = await storage.getEmergencyContact(userId);
      if (!contact)
        return res.status(404).json({ message: "Contato de emerg\xEAncia n\xE3o encontrado" });
      res.json(contact);
    } catch {
      res.status(500).json({ message: "Erro ao buscar contato de emerg\xEAncia" });
    }
  });
  app2.put("/api/emergency-contact/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id))
        return res.status(400).json({ message: "ID inv\xE1lido" });
      const updated = await storage.updateEmergencyContact(id, req.body);
      if (!updated)
        return res.status(404).json({ message: "Contato de emerg\xEAncia n\xE3o encontrado" });
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Erro ao atualizar contato de emerg\xEAncia" });
    }
  });
  app2.post("/api/alarm-config", async (req, res) => {
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
      res.status(500).json({ message: "Erro ao criar configura\xE7\xE3o de alarme" });
    }
  });
  app2.get("/api/alarm-config/:userId", async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      if (isNaN(userId))
        return res.status(400).json({ message: "ID inv\xE1lido" });
      const config = await storage.getAlarmConfig(userId);
      if (!config)
        return res.status(404).json({ message: "Configura\xE7\xE3o de alarme n\xE3o encontrada" });
      res.json(config);
    } catch {
      res.status(500).json({ message: "Erro ao buscar configura\xE7\xE3o de alarme" });
    }
  });
  app2.put("/api/alarm-config/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id))
        return res.status(400).json({ message: "ID inv\xE1lido" });
      const updated = await storage.updateAlarmConfig(id, req.body);
      if (!updated)
        return res.status(404).json({ message: "Configura\xE7\xE3o de alarme n\xE3o encontrada" });
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Erro ao atualizar configura\xE7\xE3o de alarme" });
    }
  });
  app2.get("/api/user/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id))
        return res.status(400).json({ message: "ID inv\xE1lido" });
      const user = await storage.getUser(id);
      if (!user)
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado" });
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch {
      res.status(500).json({ message: "Erro ao buscar usu\xE1rio" });
    }
  });
  app2.put("/api/user/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id))
        return res.status(400).json({ message: "ID inv\xE1lido" });
      const updated = await storage.updateUser(id, req.body);
      if (!updated)
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado" });
      const { password, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch {
      res.status(500).json({ message: "Erro ao atualizar usu\xE1rio" });
    }
  });
  app2.post("/api/send-emergency", async (req, res) => {
    try {
      const { userId } = req.body;
      const uid = Number(userId);
      if (!uid || isNaN(uid))
        return res.status(400).json({ message: "ID do usu\xE1rio \xE9 obrigat\xF3rio e v\xE1lido" });
      const user = await storage.getUser(uid);
      const contact = await storage.getEmergencyContact(uid);
      if (!user || !contact)
        return res.status(404).json({ message: !user ? "Usu\xE1rio n\xE3o encontrado" : "Contato de emerg\xEAncia n\xE3o encontrado" });
      res.json({
        success: true,
        message: `Mensagem de emerg\xEAncia enviada para ${contact.name} em ${contact.whatsapp}`
      });
    } catch {
      res.status(500).json({ message: "Erro ao enviar mensagem de emerg\xEAncia" });
    }
  });
}

// server/index.ts
import { neon } from "@neondatabase/serverless";
if (!process.env.NEON_DB_URL) {
  throw new Error("A vari\xE1vel de ambiente NEON_DB_URL n\xE3o est\xE1 configurada.");
}
var sql = neon(process.env.NEON_DB_URL);
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get("/ping", (_req, res) => {
  res.send("pong \u{1F3D3}");
});
app.get("/health", async (_req, res) => {
  try {
    await sql`SELECT 1`;
    res.status(200).send("\u2705 Database connected!");
  } catch (err) {
    console.error("Erro no /health:", err);
    res.status(500).send("\u274C Database connection failed");
  }
});
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});
registerRoutes(app).catch((err) => {
  console.error("Erro ao registrar rotas:", err);
});
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});
app.listen(3e3, () => {
  console.log("\u{1F680} Server listening on http://localhost:3000");
});
