import axios from "axios";

// In production (HF Spaces), API is served from same origin
// In development, proxy to localhost:8000
const baseURL = process.env.NODE_ENV === "production"
  ? "/api/v1"
  : "http://localhost:8000/api/v1";

const API = axios.create({ baseURL });

export const analyzeTransaction = (data) => API.post("/analyze", data);
export const analyzeBulk = (file) => {
  const form = new FormData();
  form.append("file", file);
  return API.post("/analyze/bulk", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const downloadReport = (results) =>
  API.post("/report", results, { responseType: "blob" });