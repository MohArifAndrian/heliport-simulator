import "dotenv/config";
import express from "express";
import cors from "cors";
import adminRoutes from "./routes/admin.routes.js";
import pengajarRoutes from "./routes/pengajar.routes.js";
import siswaRoutes from "./routes/siswa.routes.js";
import tugasRoutes from "./routes/tugas.routes.js";
import pengumpulanTugasRoutes from "./routes/pengumpulanTugas.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "heliport-simulator-api" });
});

app.use("/api/admin", adminRoutes);
app.use("/api/pengajar", pengajarRoutes);
app.use("/api/siswa", siswaRoutes);
app.use("/api/tugas", tugasRoutes);
app.use("/api/pengumpulan-tugas", pengumpulanTugasRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API berjalan di http://localhost:${PORT}`);
});
