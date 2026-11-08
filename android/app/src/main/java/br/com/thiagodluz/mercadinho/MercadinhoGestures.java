package br.com.thiagodluz.mercadinho;

import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "MercadinhoGestures")
public class MercadinhoGestures extends Plugin {
    @PluginMethod
    public void readInsets(PluginCall call) {
        WebView webView = getBridge().getWebView();
        webView.post(() -> {
            JSObject result = new JSObject();
            WindowInsetsCompat windowInsets = ViewCompat.getRootWindowInsets(webView);
            if (windowInsets != null) {
                Insets gestures = windowInsets.getInsets(WindowInsetsCompat.Type.systemGestures());
                float density = webView.getResources().getDisplayMetrics().density;
                result.put("left", (int) Math.ceil(gestures.left / density));
                result.put("right", (int) Math.ceil(gestures.right / density));
            }
            call.resolve(result);
        });
    }
}
