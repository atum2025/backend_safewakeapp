import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Teste simples
app.get("/ping", (_req, res) => {
  res.send("pong 🏓");
});

// Teste de conexão com banco
app.get("/health", async (_req, res) => {
  try {
    await db.execute("SELECT 1");
    res.status(200).send("✅ Database connected!");
  } catch (err) {
    console.error("Erro no /health:", err);
    res.status(500).send("❌ Database connection failed");
  }
});

// Log de requisições /api
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

// Inicializa rotas e exporta app
registerRoutes(app).catch((err) => {
  console.error("Erro ao registrar rotas:", err);
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

if (app.get("env") === "development") {
  setupVite(app).catch(console.error);
} else {
  serveStatic(app);
}

export default app;
