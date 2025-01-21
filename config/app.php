<?php

return [

	'env' => env('APP_ENV', 'production'),

	'debug' => (bool) env('APP_DEBUG', false),

	'key' => env('APP_KEY'),

	'view' => [
		'controller_namespace' => 'App\Http\Controllers',
		'cache_enabled' => true,
		'cache_path' => dirname(__DIR__) . '/storage/views',
		'paths' => [
			dirname(__DIR__) . '/resources/views',
		],
	],

	'request' => [
		'ajax' => [
			'url' => admin_url('admin-ajax.php'),
			'nonce_key' => 'app_nonce',
		],
	],

];
