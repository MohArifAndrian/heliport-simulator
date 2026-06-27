import bcrypt from "bcrypt";

const ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

export async function hashPassword(password) {
  return bcrypt.hash(password, ROUNDS);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function stripPassword(record) {
  if (!record) return null;
  const { password, ...rest } = record;
  return rest;
}

export function stripPasswordList(records) {
  return records.map(stripPassword);
}
