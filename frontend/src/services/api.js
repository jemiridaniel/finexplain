import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:8000/api/v1" });

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