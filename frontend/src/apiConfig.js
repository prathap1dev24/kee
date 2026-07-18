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

// Triggers a real file download rather than a page/tab navigation.
//
// Earlier version of this fetched the file as a blob first (await
// fetch(...).blob()) and clicked a blob: link afterwards. That broke on
// mobile browsers: fetching a blob first introduces an async gap between
// the user's tap and the click(), and most mobile browsers only allow
// download-triggering actions within the synchronous call stack of the
// original user gesture — once that gap exists, the browser falls back to
// just opening/viewing the file instead of downloading it.
//
// The fix is a plain, synchronous <a> click (no await beforehand) so it
// stays inside the gesture, combined with the backend now sending
// `Content-Disposition: attachment` on these URLs (see file.service.ts and
// main.ts) — that HTTP header is what actually forces a save-to-device
// across every browser, same-origin or not, rather than relying on the
// HTML `download` attribute (which browsers ignore cross-origin anyway).
export const downloadAsset = (url, filename) => {
  if (!url) return;
  const link = document.createElement('a');
  link.href = getAssetUrl(url);
  if (filename) link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
