package br.com.thiagodluz.mercadinho;

import android.graphics.Rect;
import android.webkit.WebView;
import java.util.Collections;
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
                result.put("immersive", !windowInsets.isVisible(WindowInsetsCompat.Type.navigationBars()));
            }
            call.resolve(result);
        });
    }

    @PluginMethod
    public void setBoardBounds(PluginCall call) {
        Double top = call.getDouble("top");
        Double bottom = call.getDouble("bottom");
        if (top == null || bottom == null || !Double.isFinite(top) || !Double.isFinite(bottom)) {
            call.reject("Limites do tabuleiro inválidos.");
            return;
        }
        WebView webView = getBridge().getWebView();
        webView.post(() -> {
            float density = webView.getResources().getDisplayMetrics().density;
            int yTop = Math.max(0, (int) Math.floor(top * density));
            int yBottom = Math.min(webView.getHeight(), (int) Math.ceil(bottom * density));
            if (yBottom <= yTop) {
                ViewCompat.setSystemGestureExclusionRects(webView, Collections.emptyList());
            } else {
                ViewCompat.setSystemGestureExclusionRects(
                    webView, Collections.singletonList(new Rect(0, yTop, webView.getWidth(), yBottom))
                );
            }
            call.resolve();
        });
    }
}
