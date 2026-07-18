// Base URL for the NestJS backend. In local dev this stays empty, so
// requests go to relative paths like /api/... which Vite's dev server
// proxies to http://localhost:4000 (see vite.config.js).
//
// In production (Firebase Hosting), the frontend and backend are on
// different domains (Firebase Hosting can't proxy /api/** to an external
// host like Render — that rewrite type only supports Cloud Functions/Cloud
// Run). So VITE_API_BASE_URL must be set at build time to the live Render
// backend URL, e.g. https://kee-dopg.onrender.com, and every request is
// made directly to that origin instead. The backend already has CORS
// enabled for all origins (see backend/src/main.ts), so this works as-is.
export const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// Uploaded file URLs (customer photos/signatures/documents, shop
// verification docs) are stored in the DB as backend-relative paths like
// "/api/uploads/xxx.png" (see backend/src/customer/file.service.ts). Those
// need the same API_BASE prefix to resolve cross-origin. Client-generated
// previews (data: URLs from webcam/signature capture, before upload) and
// any absolute http(s) URLs (e.g. ad/promotion image links) are returned
// unchanged.
export const getAssetUrl = (url) => {
  if (!url) return url;
  return url.startsWith('/api') ? `${API_BASE}${url}` : url;
};

// Plain <a href download> only forces a download for same-origin URLs —
// browsers ignore the `download` attribute cross-origin and just navigate
// to it instead (which is what shows a raw JSON error page for a missing
// file, or opens the asset in a new tab instead of saving it). Since the
// frontend (Firebase Hosting) and backend (Render) are different origins,
// fetch the file as a blob ourselves and trigger the download from a local
// blob: URL instead, which is always same-origin. Also gives a clean error
// message instead of a blank page if the file no longer exists on the
// server (e.g. lost after a container restart wiped local disk storage).
export const downloadAsset = async (url, filename = 'document') => {
  if (!url) return;
  try {
    const response = await fetch(getAssetUrl(url));
    if (!response.ok) throw new Error('File not found');
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    alert('This file is no longer available on the server. It may have been lost during a recent system update — please re-upload it.');
  }
};
