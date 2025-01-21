<?php

namespace App\Http\Requests;

class Foo extends Ajax
{
	protected $action = 'app/foo';

	protected $public = true;

	public function response($request)
	{
		return $request;
	}
}
