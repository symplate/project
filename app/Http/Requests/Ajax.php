<?php

namespace App\Http\Requests;

use WP_Error;
use App\Support\Helpers;

class Ajax
{
    /**
     * The action associated with the Ajax request.
     *
     * @var string
     */
    protected $action;

    /**
     * The request data.
     *
     * @var array
     */
    protected $request;

    /**
     * Whether the Ajax request is public or not.
     *
     * @var bool
     */
    protected $public = false;

    /**
     * Whether to unslash the request data.
     *
     * @var bool
     */
    protected $unslash = true;

    /**
     * Initializes the Ajax request handler.
     */
    public function __construct()
    {
        $this->init();
        $this->addActions();
    }

    /**
     * Initialization logic can be added here if needed.
     */
    protected function init()
    {
        // Initialization logic can be added here if needed.
    }

    /**
     * Adds action hooks for handling the Ajax request.
     */
    private function addActions()
    {
        add_action("wp_ajax_{$this->action}", [$this, 'request']);

        if ($this->public) {
            add_action("wp_ajax_nopriv_{$this->action}", [$this, 'request']);
        }
    }

    /**
     * Checks if a key exists in the request data.
     *
     * @param string $key The key to check.
     * @return bool True if the key exists, false otherwise.
     */
    public function has($key = '')
    {
        return isset($this->request[$key]);
    }

    /**
     * Gets a value from the request data.
     *
     * @param string $key The key to get the value for.
     * @param mixed $default Default returned value.
     * @return mixed|null The value for the specified key or null if not found.
     */
    public function get($key = '', $default = null)
    {
        return $this->request[$key] ?? $default;
    }

    /**
     * Sets a value in the request data.
     *
     * @param string $key The key to set the value for.
     * @param mixed $value The value to set.
     * @return $this The Ajax instance for method chaining.
     */
    public function set($key = '', $value = null)
    {
        $this->request[$key] = $value;

        return $this;
    }

    /**
     * Handles the Ajax request.
     */
    public function request()
    {
        $this->request = $this->unslash ? wp_unslash($_REQUEST) : $_REQUEST;

        $error = $this->verifyRequest($this->request);

        if (is_wp_error($error)) {
            $this->send($error);
        }

        $this->send($this->response($this->request));
    }

    /**
     * Verifies the Ajax request for security.
     *
     * @param array $request The request data to verify.
     * @return bool|WP_Error True if the request is valid, WP_Error if invalid.
     */
    private function verifyRequest($request)
    {
        if (!Helpers::verifyAjaxRequest()) {
            return new WP_Error(
                'app_invalid_nonce',
                __('Invalid nonce.', 'app'),
                [
                    'status' => 404,
                ]
            );
        }

        return true;
    }

    /**
     * Generates the response for the Ajax request.
     *
     * @param array $request The request data.
     * @return mixed The response data.
     */
    public function response($request)
    {
        return true;
    }

    /**
     * Sends the response, either JSON or error.
     *
     * @param mixed $response The response data to send.
     */
    public function send($response)
    {
        if (is_wp_error($response)) {
            $this->sendError($response);
        }
        else {
            wp_send_json($response);
        }
    }

    /**
     * Sends an error response as JSON.
     *
     * @param WP_Error $error The error object to send.
     */
    public function sendError($error)
    {
        $error_data = $error->get_error_data();

        if (is_array($error_data) && isset($error_data['status'])) {
            $status_code = $error_data['status'];
        }
        else {
            $status_code = 500;
        }

        wp_send_json(
            [
             'code'    => $error->get_error_code(),
             'message' => $error->get_error_message(),
             'data'    => $error->get_error_data(),
            ],
            $status_code
        );
    }
}
