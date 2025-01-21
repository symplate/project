<?php

namespace App\Theme;

use WP_Theme;
use App\Support\Singleton;
use App\Support\Settings\Settings;

/**
 * Class Theme - Manages WordPress theme functionalities.
 */
class Theme
{
	use Singleton;
	use Settings;

	/** @var WP_Theme Information about the WordPress theme. */
	public WP_Theme $data;

	/** @var string The theme version. */
	public string $version;

	/** @var  Theme settings. */
	public $settings;

	/** @var array Assets array. */
	private array $assets;

	/** @var array JSON manifest content. */
	private array $manifest = [];

	/** @var ColorSchemes Instance. */
	public ColorSchemes $colorSchemes;

	/**
	 * Initializes the theme by retrieving necessary information.
	 */
	public function init(): void
	{
		$this->data = wp_get_theme();
		$this->version = $this->data->get('Version');
		$this->settings = get_fields('theme_settings');
		$this->colorSchemes = ColorSchemes::instantiate();

		$manifest_path = config('theme.assets.manifest_path');
		if ($manifest_path && file_exists($manifest_path)) {
			$this->manifest = json_decode(file_get_contents($manifest_path), true);
		}

		// Add WordPress actions
		add_action('init', [$this, 'initialize']);
		add_action('after_setup_theme', [$this, 'setup']);
		add_filter('show_admin_bar', fn () => false);
		add_action('wp_enqueue_scripts', [$this, 'enqueueScripts']);

		// Load scripts as modules.
		add_filter('script_loader_tag', function (string $tag, string $handle, string $src) {
			if (in_array($handle, ['vite', 'wordplate'])) {
				return '<script type="module" src="' . esc_url($src) . '" defer></script>';
			}

			return $tag;
		}, 10, 3);

		if (!is_admin()) {
			add_filter('script_loader_tag', [$this, 'scriptLoaderTag'], 10, 3);
			add_filter('style_loader_tag', [$this, 'styleLoaderTag'], 10, 4);
		}

		// 
		$this->injectScripts();

		// 
		$this->apiIntegration();

		// Discourage search engines from indexing in non-production environments.
		add_action('pre_option_blog_public', fn() => wp_get_environment_type() === 'production');
	}

	/**
	 * Initializes the theme by adding custom post types and taxonomies.
	 */
	public function initialize(): void
	{
		// Add custom post types
		foreach (config('post_types') ?: [] as $name => $settings) {
			$labels = $settings['labels'] ?? [];
			register_extended_post_type($name, $settings['general'], $labels);
		}

		// // Add custom taxonomies
		// foreach (config('taxonomies') ?: [] as $name => $settings) {
		// 	$labels = $settings['labels'] ?? [];
		// 	register_extended_taxonomy($name, $settings['post_type'], $settings['args'], $labels);
		// }

		// Register theme menus
		register_nav_menus(config('theme.menus') ?: []);
	}

	/**
	 * Sets up theme features after initialization.
	 */
	public function setup(): void
	{
		add_theme_support('title-tag');
		add_theme_support('post-thumbnails');
	}

	public function apiIntegration(): void
	{
		$settings = get_fields('api_tools_settings');

		if (!empty($settings['google_tag_manager']['enable_tracking']) && !empty($settings['google_tag_manager']['tracking_id'])) {
			add_action('neo/tracking/google-tag-manager', function () use ($settings) {
				view()->echo('snippets.head-google-tag-manager', [
					'tracking_id' => $settings['google_tag_manager']['tracking_id'],
				]);
			});
		}

		if (!empty($settings['google_analytics']['enable_tracking']) && !empty($settings['google_analytics']['tracking_id'])) {
			add_action('neo/tracking/google-analytics', function () use ($settings) {
				view()->echo('snippets.head-google-analytics', [
					'tracking_id' => $settings['google_analytics']['tracking_id'],
				]);
			});
		}

		if (!empty($settings['meta_pixel']['enable_tracking']) && !empty($settings['meta_pixel']['tracking_id'])) {
			add_action('neo/tracking/meta-pixel', function () use ($settings) {
				view()->echo('snippets.head-meta-pixel', [
					'tracking_id' => $settings['meta_pixel']['tracking_id'],
				]);
			});
		}
	}

	/**
	 * Method to inject custom scripts into the <head> and before </body> of HTML.
	 */
	private function injectScripts(): void
	{
		$settings = get_fields('scripts_settings');

		add_action('wp_head', function () use ($settings) {
			if (!empty($settings['head_script'])) {
				echo '<script>' . $settings['head_script'] . '</script>';
			}
		});

		add_action('wp_footer', function () use ($settings) {
			if (!empty($settings['footer_script'])) {
				echo '<script>' . $settings['footer_script'] . '</script>';
			}
		});
	}

	/**
	 * Customize the script tag to load scripts as modules.
	 *
	 * @param string $tag Current script tag.
	 * @param string $handle Script name.
	 * @param string $src Script URL.
	 *
	 * @return string Customized script tag.
	 */
	public function scriptLoaderTag(string $tag, string $handle, string $src): string
	{
		return "<script type=\"module\" src=\"" . esc_url($src) . "\" defer></script>\n";
	}

	/**
	 * Customize the style tag to load styles.
	 *
	 * @param string $tag Current style tag.
	 * @param string $handle Style name.
	 * @param string $href Style URL.
	 * @param string $media Style media attribute.
	 *
	 * @return string Customized style tag.
	 */
	public function styleLoaderTag(string $tag, string $handle, string $href, string $media): string
	{
		return "<link rel=\"stylesheet\" href=\"" . esc_url($href) . "\">\n";
	}

	/**
	 * Enqueue scripts and styles based on the environment.
	 */
	public function enqueueScripts()
	{
		if (wp_get_environment_type() === 'local' && is_array(wp_remote_get('http://localhost:5173/'))) {
			wp_enqueue_script('vite', 'http://localhost:5173/' . '@vite/client');
			wp_enqueue_script('app.js', 'http://localhost:5173/' . 'resources/js/index.js');
		}
		else {
			wp_enqueue_style('app.css', $this->getAssetURI('app.css'), [], null, 'all');
			wp_enqueue_script('app.js', $this->getAssetURI('app.js'), [], null, false);
			// wp_enqueue_script('animations.js', $this->getAssetURI('animations.js'), [], null, false);
		}

		$app_config = [
			'style' => config('theme.style'),
			'ajax' => [
				'url'   => config('app.ajax.url'),
				'nonce' => wp_create_nonce(config('app.ajax.nonce_string')),
			],
		];

		wp_localize_script('app.js', 'AppConfig', $app_config);
	}

	public function getAssetURI(string $handle)
	{
		$pathinfo = pathinfo($handle);
		$extension = ($pathinfo['extension']);

		if ($extension == 'css') {

			$pos = strrpos($handle, '.css');

			if ($pos !== false) {
				$handle = substr_replace($handle, '.scss', $pos, strlen('.scss'));
			}
		}
dd($this->manifest);
		foreach ($this->manifest as $key => $params) {
			if (substr_compare($key, $handle, - strlen($handle)) === 0) {
				if (!empty($this->manifest[$key]['file'])) {
					$file_path = path_join(config('theme.assets.path'), $this->manifest[$key]['file']);
					$file_uri  = path_join(config('theme.assets.uri'), $this->manifest[$key]['file']);
					if (file_exists($file_path)) {
						return $file_uri;
					}
				}
			}
		}

		return null;
	}

	public function stylesheetTag(string $handle, array $args = [])
	{
		if (wp_get_environment_type() === 'local' && is_array(wp_remote_get('http://localhost:5173/'))) {
			return;
		}

		if ($uri = $this->getAssetURI($handle)) {
			$args = array_merge([
				'noscript_tag' => false,
			], $args);

			if ($args['noscript_tag'] === true) {
				return '<link href="' . $uri . '" rel="stylesheet" type="text/css" media="print" onload="this.media=\'all\'"/>
						<noscript><link href="' . $uri . '" rel="stylesheet" type="text/css" media="all" /></noscript>';
			}

			return '<link href="' . $uri . '" rel="stylesheet" type="text/css" media="all">';
		}

		return '';
	}

	public function scriptTag(string $handle, array $args = [])
	{
		if (wp_get_environment_type() === 'local' && is_array(wp_remote_get('http://localhost:5173/'))) {
			return;
		}

		if ($uri = $this->getAssetURI($handle)) {
			return '<script src="' . $uri . '" type="module" defer="defer"></script>';
		}

		return '';
	}

	/**
	 * Define a constant if it doesn't already exist.
	 *
	 * @param string $name  Constant name.
	 * @param mixed  $value Constant value.
	 */
	private function define(string $name, mixed $value = true): void
	{
		if (!defined($name)) {
			define($name, $value);
		}
	}
}
