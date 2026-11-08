package br.com.thiagodluz.mercadinho;

import android.os.Build;
import android.view.HapticFeedbackConstants;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "MercadinhoHaptics")
public class MercadinhoHaptics extends Plugin {
    @PluginMethod
    public void pulse(PluginCall call) {
        String kind = call.getString("kind", "preview");
        int feedback = switch (kind) {
            case "place" -> HapticFeedbackConstants.CLOCK_TICK;
            case "match", "preview" -> Build.VERSION.SDK_INT >= Build.VERSION_CODES.R
                ? HapticFeedbackConstants.CONFIRM : HapticFeedbackConstants.VIRTUAL_KEY;
            default -> -1;
        };

        if (feedback < 0) {
            call.reject("Tipo de feedback desconhecido.");
            return;
        }

        getActivity().runOnUiThread(() -> {
            getBridge().getWebView().performHapticFeedback(feedback);
            call.resolve();
        });
    }
}
