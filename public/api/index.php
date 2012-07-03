<?php

require $_SERVER['DOCUMENT_ROOT'] . '/../application/bootstrap.php';

$app->post('/tag', function () use ($app, $DBH) {
	$app->contentType('application/json');

	$tag = $app->request()->post('tag');

	/* How can we make sure that the tag is unique? Track_href and user_id are the keys */
	$STH = $DBH->prepare("INSERT INTO `tags` (`message`, `type`, `post_id`, `user_id`, `user_name`, `tracks_uris`, `track_uri`, `track_name`, `track_artist`) VALUES (:message, :type, :post_id, :user_id, :user_name, :tracks_uris, :track_uri, :track_name, :track_artist)");

	if ($STH->execute(array(
		'message' => $tag['message'],
		'type' => $tag['type'],
		'post_id' => $tag['post']['id'],
		'user_id' => $tag['user']['from']['id'],
		'user_name' => $tag['user']['from']['name'],
		'tracks_uris' => isset($tag['tracks']['uris']) ? implode(',', $tag['tracks']['uris']) : "",
		'track_uri' => isset($tag['track']['uri']) ? $tag['track']['uri'] : "",
		'track_name' => isset($tag['track']['name']) ? $tag['track']['name'] : "",
		'track_artist' => isset($tag['track']['artist']) ? $tag['track']['artist'] : ""
	))) {
		$tag['id'] = $DBH->lastInsertId();

		echo json_encode($tag);
	}
});

$app->delete('/tag/:id', function ($id) use ($app, $DBH, $facebook) {
	$app->contentType('application/json');

	if ($user_id = $facebook->getUser()) {
		$STH = $DBH->prepare("DELETE FROM `tags` WHERE `id` = :id AND `user_id` = :user_id");
		if ($STH->execute(array(
			'id' => $id,
			'user_id' => $user_id
		))) {
			return true;
		}
	}
});

$app->get('/tags', function () use ($app, $DBH) {
	$app->contentType('application/json');

	$posts = $app->request()->get('posts');

	$STH = $DBH->prepare("SELECT `id`, `message`, `type`, `post_id`, `user_id`, `user_name`, `tracks_uris`, `track_uri`, `track_name`, `track_artist` FROM `tags` WHERE `post_id` IN (" . rtrim(str_repeat('?, ', count($posts)), ', ') . ")");
	
	if ($STH->execute($posts)) {
		$tags = $STH->fetchAll();

		echo json_encode($tags);
	}
});

$app->get('/track/:name/:artist', function ($name, $artist) use ($app) {
	$XML = simplexml_load_file('http://ws.audioscrobbler.com/2.0/?method=track.search&track=' . $name . ' ' . $artist . '&api_key=8dfbed707d888b353fa6adf4cefc74b1&limit=1');
	$track = $XML->results->trackmatches->track;

	return $app->render('track.twig.html', array(
		'track' => $track
	));
});

$app->run();