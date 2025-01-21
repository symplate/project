<?php

class acf_admin_options_page
{
	public $page;

	public function __construct()
	{
		add_action('admin_init', function () {
			neo_admin()->isFrameworkPage();
		});

		add_action('admin_menu', [$this, 'admin_menu'], 99, 0);
	}

	public function admin_menu()
	{
		$pages = acf_get_options_pages();

		if (empty($pages)) {
			return;
		}

		foreach ($pages as $page) {
			$slug = '';

			if (empty($page['parent_slug'])) {
				$slug = add_menu_page(
					$page['page_title'],
					$page['menu_title'],
					$page['capability'],
					$page['menu_slug'],
					[$this, 'renderPage'],
					$page['icon_url'],
					$page['position']
				);
			}
			else {
				$slug = add_submenu_page(
					$page['parent_slug'],
					$page['page_title'],
					$page['menu_title'],
					$page['capability'],
					$page['menu_slug'],
					[$this, 'renderPage'],
					$page['position']
				);
			}

			add_action("load-{$slug}", [$this, 'admin_load']);
		}
	}

	public function admin_load()
	{
		global $plugin_page;

		$this->page = acf_get_options_page($plugin_page);
		$this->page['post_id'] = acf_get_valid_post_id($this->page['post_id']);

		if (acf_verify_nonce('options')) {
			if (acf_validate_save_post(true)) {
				acf_update_setting('autoload', $this->page['autoload']);

				acf_save_post($this->page['post_id']);

				do_action('acf/options_page/save', $this->page['post_id'], $this->page['menu_slug']);

				wp_redirect(add_query_arg(['notice' => 'update']));
				exit;
			}
		}

		acf_enqueue_scripts();

		add_action('acf/input/admin_enqueue_scripts', [$this, 'admin_enqueue_scripts']);
		add_action('acf/input/admin_head', [$this, 'admin_head']);
	}

	public function admin_enqueue_scripts()
	{
		wp_enqueue_script('post');
	}

	public function admin_head()
	{
		// 
	}

	public function renderPage()
	{
		$field_groups_array = acf_get_field_groups([
			'options_page' => $this->page['menu_slug'],
		]) ?: [];

		if (empty($field_groups_array)) {
			if (!empty($this->page['page_view']) && view()->exists($this->page['page_view'])) {
				view()->echo($this->page['page_view'], [
					'page'            => $this->page,
					'page_full_width' => !empty($this->page['page_full_width']),
				]);
			}

			return;
		}

		$field_groups = [];
		foreach ($field_groups_array as $field_group) {
			$postbox_data = [
				'id'         => 'acf-' . $field_group['key'],
				'key'        => $field_group['key'],
				'style'      => $field_group['style'],
				'label'      => $field_group['label_placement'],
				'editLink'   => '',
				'editTitle'  => __('Edit field group', 'neo'),
				'visibility' => true,
			];

			if ($field_group['ID'] && acf_current_user_can_admin()) {
				$postbox_data['editLink'] = admin_url('post.php?post=' . $field_group['ID'] . '&action=edit');
			}

			$field_groups[] = [
				'group'        => $field_group,
				'postbox_data' => $postbox_data,
			];
		}

		$view = $this->page['page_view'] ?? null;

		if (!is_string($view) || !view()->exists($view)) {
			$view = 'admin.pages.neo-default-settings-page';
		}

		$notice = (!empty($_GET['notice']) && ($_GET['notice'] === 'update' || $_GET['notice'] === 'reset')) ? $_GET['notice'] : null;

		view()->echo($view, [
			'page'            => $this->page,
			'page_full_width' => !empty($this->page['page_full_width']),
			'field_groups'    => $field_groups,
			'notice'          => $notice,
		]);
	}
}

new acf_admin_options_page();
