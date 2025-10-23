import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files (your HTML, JS, CSS)
app.use(express.static(path.join(__dirname, "dist"))); // or "public" if you rename it

// Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "template.html"));
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

