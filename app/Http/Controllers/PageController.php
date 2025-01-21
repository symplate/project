<?php

namespace App\Http\Controllers;

use Illuminate\Support\Str;
use App\View\BladeController;

class PageController extends BladeController
{
	protected $id;

	public function __construct()
	{
		global $post;

		$this->id = $post->ID ?? null;

		app()->addRequestHandler('App\\Http\\Requests\\Foo');
	}
}
