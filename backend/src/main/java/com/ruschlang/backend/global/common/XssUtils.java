package com.ruschlang.backend.global.common;

public final class XssUtils {
    private XssUtils() {
    }

    public static String sanitize(String input) {
        if (input == null) {
            return null;
        }
        return input
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#x27;");
    }
}
