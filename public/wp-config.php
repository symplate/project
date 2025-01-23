<?php

declare(strict_types=1);

define('APP_START', microtime(true));

require __DIR__ . '/../vendor/autoload.php';

// Boot application.
$app = (require __DIR__.'/../bootstrap/app.php');

dump($app);

exit;




// Set the absolute path to the WordPress directory.
if (!defined('ABSPATH')) {
    define('ABSPATH', sprintf('%s/%s/', __DIR__, env('WP_DIR', 'wp')));
}

// Set the database table prefix.
$table_prefix = env('DB_TABLE_PREFIX', 'wp_');

require_once ABSPATH . 'wp-settings.php';
