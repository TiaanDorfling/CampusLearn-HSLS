// src/utils/validators.js
export function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());
}
export function isCampusEmail(s) {
  return /@belgiumcampus\.ac\.za$/i.test(String(s || "").trim());
}
export function minLen(s, n=8) {
  return String(s || "").length >= n;
}
