package com.kee.app;

import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

// Saves a file that's already been downloaded into the app's private cache
// (see Filesystem.downloadFile() in apiConfig.js) into the device's public
// Downloads folder, so it shows up in the system Files/Downloads app like a
// normal browser download - instead of only being reachable through the OS
// share sheet (which is what downloadAsset() used to rely on exclusively,
// and which never actually placed a copy in Downloads unless the user
// manually picked a "save" target from the chooser).
//
// This can't be done with Capacitor's built-in Filesystem plugin - none of
// its Directory options (Documents/External/ExternalStorage) can write to
// the public Downloads folder on Android 10+ (scoped storage) without
// android:requestLegacyExternalStorage, which stops being honored entirely
// once targetSdkVersion >= 30 (this app targets 36). So there are two real
// code paths, split by OS version:
//   - Android 10+ (API 29+): insert into MediaStore.Downloads. No runtime
//     permission needed - this is Google's supported scoped-storage way in,
//     and what most of this app's real-world users will hit.
//   - Android 9 and below (API 24-28): legacy direct File write into
//     Environment.DIRECTORY_DOWNLOADS, which DOES require the dangerous
//     WRITE_EXTERNAL_STORAGE runtime permission on those versions - so this
//     path prompts the user for it first.
@CapacitorPlugin(
    name = "SaveToDownloads",
    permissions = {
        @Permission(strings = { android.Manifest.permission.WRITE_EXTERNAL_STORAGE }, alias = "storage")
    }
)
public class SaveToDownloadsPlugin extends Plugin {

    @PluginMethod
    public void saveFile(PluginCall call) {
        String sourcePath = call.getString("sourcePath");
        String fileName = call.getString("fileName");
        String mimeType = call.getString("mimeType", "application/octet-stream");

        if (sourcePath == null || fileName == null) {
            call.reject("sourcePath and fileName are required");
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            saveViaMediaStore(call, sourcePath, fileName, mimeType);
            return;
        }

        if (getPermissionState("storage") != PermissionState.GRANTED) {
            requestPermissionForAlias("storage", call, "storagePermCallback");
            return;
        }
        saveViaLegacyFile(call, sourcePath, fileName);
    }

    @PermissionCallback
    private void storagePermCallback(PluginCall call) {
        if (getPermissionState("storage") == PermissionState.GRANTED) {
            saveViaLegacyFile(call, call.getString("sourcePath"), call.getString("fileName"));
        } else {
            call.reject("Storage permission was denied - cannot save to Downloads.");
        }
    }

    private void saveViaMediaStore(PluginCall call, String sourcePath, String fileName, String mimeType) {
        Uri itemUri = null;
        try {
            ContentValues values = new ContentValues();
            values.put(MediaStore.Downloads.DISPLAY_NAME, fileName);
            values.put(MediaStore.Downloads.MIME_TYPE, mimeType);
            values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
            values.put(MediaStore.Downloads.IS_PENDING, 1);

            itemUri = getContext().getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
            if (itemUri == null) {
                call.reject("Could not create entry in Downloads.");
                return;
            }

            try (
                InputStream in = new FileInputStream(resolveSourceFile(sourcePath));
                OutputStream out = getContext().getContentResolver().openOutputStream(itemUri)
            ) {
                if (out == null) {
                    call.reject("Could not open Downloads entry for writing.");
                    return;
                }
                copy(in, out);
            }

            ContentValues doneValues = new ContentValues();
            doneValues.put(MediaStore.Downloads.IS_PENDING, 0);
            getContext().getContentResolver().update(itemUri, doneValues, null, null);

            JSObject result = new JSObject();
            result.put("uri", itemUri.toString());
            call.resolve(result);
        } catch (Exception ex) {
            // Clean up the half-written MediaStore row so it doesn't linger
            // as a broken/zero-byte entry in the user's Downloads folder.
            if (itemUri != null) {
                try {
                    getContext().getContentResolver().delete(itemUri, null, null);
                } catch (Exception ignored) {}
            }
            call.reject("Failed to save file to Downloads: " + ex.getMessage(), ex);
        }
    }

    @SuppressWarnings("deprecation")
    private void saveViaLegacyFile(PluginCall call, String sourcePath, String fileName) {
        try {
            File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
            if (!downloadsDir.exists()) downloadsDir.mkdirs();
            File destFile = new File(downloadsDir, fileName);

            try (
                InputStream in = new FileInputStream(resolveSourceFile(sourcePath));
                OutputStream out = new FileOutputStream(destFile)
            ) {
                copy(in, out);
            }

            JSObject result = new JSObject();
            result.put("uri", Uri.fromFile(destFile).toString());
            call.resolve(result);
        } catch (Exception ex) {
            call.reject("Failed to save file to Downloads: " + ex.getMessage(), ex);
        }
    }

    private File resolveSourceFile(String sourcePath) {
        // sourcePath arrives as a file:// URI string (from Capacitor
        // Filesystem.getUri()); strip the scheme to get a plain filesystem path.
        String path = sourcePath.startsWith("file://") ? sourcePath.substring(7) : sourcePath;
        return new File(Uri.decode(path));
    }

    private void copy(InputStream in, OutputStream out) throws Exception {
        byte[] buffer = new byte[8192];
        int read;
        while ((read = in.read(buffer)) != -1) {
            out.write(buffer, 0, read);
        }
        out.flush();
    }
}
