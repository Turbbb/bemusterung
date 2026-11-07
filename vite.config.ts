import { defineConfig, loadEnv, type Plugin } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

/** Bindet api/visualize.ts lokal als Middleware ein (auf Vercel läuft es als Serverfunktion). */
const visualizeDevApi = (): Plugin => ({
  name: "visualize-dev-api",
  configureServer(server) {
    server.middlewares.use("/api/visualize", async (req, res) => {
      try {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        const raw = Buffer.concat(chunks).toString("utf8");
        (req as { body?: unknown }).body = raw ? JSON.parse(raw) : undefined;
        const mod = await server.ssrLoadModule("/api/visualize.ts");
        await mod.default(req, res);
      } catch (error) {
        server.config.logger.error(String(error));
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ message: "Interner Fehler in der Visualisierung." }));
      }
    });
  },
});

export default defineConfig(({ mode }) => {
  // Nur die serverseitigen Gemini-Variablen aus .env für die Middleware bereitstellen.
  const env = loadEnv(mode, process.cwd(), "");
  for (const name of ["GEMINI_API_KEY", "GEMINI_MODEL"]) {
    if (env[name]) process.env[name] = env[name];
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [dyadComponentTagger(), react(), visualizeDevApi()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
