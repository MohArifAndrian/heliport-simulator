import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const SUBMISSIONS_FILE = path.join(DATA_DIR, "submissions.json");
const PDFS_DIR = path.join(DATA_DIR, "pdfs");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readSubmissions() {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(SUBMISSIONS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeSubmissions(list) {
  await ensureDataDir();
  await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify(list, null, 2), "utf-8");
}

export async function getAllSubmissions() {
  const list = await readSubmissions();
  return list.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

export async function getSubmissionById(id) {
  const list = await readSubmissions();
  return list.find((s) => s.id === id) ?? null;
}

export async function addSubmission(submission) {
  const list = await readSubmissions();
  list.unshift(submission);
  await writeSubmissions(list);
  return submission;
}

export async function saveSubmissionPdf(id, base64) {
  await fs.mkdir(PDFS_DIR, { recursive: true });
  const buf = Buffer.from(base64, "base64");
  const filePath = path.join(PDFS_DIR, `${id}.pdf`);
  await fs.writeFile(filePath, buf);
  return `pdfs/${id}.pdf`;
}

export async function readSubmissionPdf(id) {
  const filePath = path.join(PDFS_DIR, `${id}.pdf`);
  try {
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}
