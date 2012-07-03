<?php

ini_set('display_errors', E_ALL);
define('APP_PATH', $_SERVER['DOCUMENT_ROOT'] . '/../application');

require APP_PATH . '/libs/facebook-php-sdk/src/facebook.php';
require APP_PATH . '/libs/Slim/Slim.php';
require APP_PATH . '/libs/Slim/Extras/TwigView.php';

TwigView::$twigDirectory = APP_PATH . '/libs/Twig';

$facebook = new Facebook(array(
	'appId'  => '294833607242566',
	'secret' => '45642701be6bdb5948627535d3e091ca',
));

$app = new Slim(array(
	// Uncomment when going live
	// 'mode' => 'production',
	'view' => new TwigView,
	'templates.path' => APP_PATH . '/templates/'
));

try {
	$DBH = new PDO("mysql:host=127.0.0.1;dbname=songtag", "root", '', array(
		// Cache
		PDO::ATTR_PERSISTENT => true,
		PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
		// // Set the default fetch mode to associated so that the keys in the returned arrays equal that of the column names
		PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
	));
} catch (PDOException $error) {
	echo $error->getMessage();
}