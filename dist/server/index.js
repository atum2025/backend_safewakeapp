import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db"; // <--- conexão com o banco
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get("/ping", (_req, res) => {
    res.send("pong 🏓");
});
app.get("/health", async (_req, res) => {
    try {
        await db.execute("SELECT 1");
        res.status(200).send("✅ Database connected!");
    }
    catch (err) {
        console.error("Erro no /health:", err);
        res.status(500).send("❌ Database connection failed");
    }
});
app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse = undefined;
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
(async () => {
    const server = await registerRoutes(app);
    app.use((err, _req, res, _next) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
        throw err;
    });
    if (app.get("env") === "development") {
        await setupVite(app, server);
    }
    else {
        serveStatic(app);
    }
    const port = 5000;
    server.listen(port, "0.0.0.0", () => {
        log(`serving on port ${port}`);
    });
})();
//# sourceMappingURL=index.js.map