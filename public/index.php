<?php

require $_SERVER['DOCUMENT_ROOT'] . '/../application/bootstrap.php';

$app->map('/', function () use ($app) {
	return $app->render('home.twig.html');
})->via('GET', 'POST');

$app->map('/login', function () use ($app, $facebook) {
	$app->flash('welcome', true);

	return $app->redirect($facebook->getLoginUrl(array(
		'scope' => 'email, read_stream, publish_stream, publish_actions',
		'redirect_uri' => 'http://songtagapp.com/canvas/'
	)));
})->via('GET', 'POST');

$app->map('/canvas/', function () use ($app, $facebook) {
	$authentication = $app->request()->get();

	$permissions = $facebook->api('/me/permissions');
	$permissions = $permissions['data'][0];

	if (!$authentication || isset($authentication['error']) || !isset($permissions['read_stream'])) {
		return $app->redirect('/');
	}

	return $app->render('canvas.twig.html');
})->via('GET', 'POST');

$app->map('/privacy-policy', function () use ($app) {
	return $app->render('privacy-policy.twig.html');
})->via('GET', 'POST');

$app->run();