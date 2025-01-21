<?php

namespace App\Support;

class Helpers
{
    /**
     * Verify the current AJAX request.
     *
     * @return bool True if the request is valid, false otherwise.
     */
    public static function verifyAjaxRequest(): bool
    {
        $nonce = sanitize_text_field($_REQUEST['nonce'] ?? '');
        $action = config('app.request.ajax.nonce_key', '');

        if (empty($nonce) || !wp_verify_nonce($nonce, $action)) {
            return false;
        }

        do_action('app/verify_ajax');

        return true;
    }
}
