import { Capacitor } from '@capacitor/core';

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

// Uploaded file URLs (customer photos/documents, shop
// verification docs) are stored in the DB as backend-relative paths like
// "/api/uploads/xxx.png" (see backend/src/customer/file.service.ts). Those
// need the same API_BASE prefix to resolve cross-origin. Client-generated
// previews (data: URLs from webcam capture, before upload) and
// any absolute http(s) URLs (e.g. ad/promotion image links) are returned
// unchanged.
export const getAssetUrl = (url) => {
  if (!url) return url;
  return url.startsWith('/api') ? `${API_BASE}${url}` : url;
};

// Builds a download filename from a stored asset URL's own extension plus a
// human-readable base name, e.g. ("/api/uploads/x_1.jpg", "shop_photo") ->
// "shop_photo.jpg". Some call sites used to hardcode an extension (e.g.
// always ".pdf" for a license upload) which produced a wrong/misleading
// extension whenever the shop had actually uploaded a JPG/PNG instead -
// this keeps the downloaded file's extension accurate to what was uploaded.
export const filenameForAsset = (url, baseName) => {
  if (!url) return baseName;
  const clean = url.split('?')[0].split('#')[0];
  const match = /\.([a-zA-Z0-9]{2,5})$/.exec(clean);
  return match ? `${baseName}.${match[1].toLowerCase()}` : baseName;
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
// The fix for the *web* build is a plain, synchronous <a> click (no await
// beforehand) so it stays inside the gesture, combined with the backend
// sending `Content-Disposition: attachment` on these URLs (see
// file.service.ts and main.ts) — that HTTP header is what actually forces
// a save-to-device across every browser, same-origin or not, rather than
// relying on the HTML `download` attribute (which browsers ignore
// cross-origin anyway).
//
// Inside the packaged Android app (Capacitor), that same <a href> click is
// a top-level WebView navigation to a cross-origin URL. Capacitor's
// WebViewClient has no DownloadListener wired up and, unless the target
// origin is explicitly allow-listed, blocks the navigation outright — this
// is what surfaced to users as "Download redirects to a Chrome error
// page." Fetching over the WebView is also unreliable for the Firebase
// Storage-backed URLs. So on native platforms we bypass the WebView
// entirely: Filesystem.downloadFile() uses the native OS HTTP stack (not
// subject to WebView navigation rules or page-level CORS), saves the file
// into the app's private cache dir, and then the OS share sheet
// (@capacitor/share) lets the user save it to Downloads / open it in
// another app - preserving the original filename and extension throughout.
export const downloadAsset = async (url, filename) => {
  if (!url) return;
  const fullUrl = getAssetUrl(url);
  const safeName = (filename || fullUrl.split('/').pop().split('?')[0] || 'download').replace(/[\\/]/g, '_');

  if (Capacitor.isNativePlatform()) {
    try {
      const [{ Filesystem, Directory }, { Share }] = await Promise.all([
        import('@capacitor/filesystem'),
        import('@capacitor/share'),
      ]);
      const { uri } = await Filesystem.downloadFile({
        url: fullUrl,
        path: safeName,
        directory: Directory.Cache,
      });
      await Share.share({ url: uri, dialogTitle: `Save ${safeName}` });
    } catch (err) {
      console.error('Native file download failed:', err);
      window.alert(`Could not download "${safeName}". Please check your connection and try again.`);
    }
    return;
  }

  const link = document.createElement('a');
  link.href = fullUrl;
  if (filename) link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
