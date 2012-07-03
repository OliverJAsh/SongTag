define([
	"jquery",

	"tpl!/templates/partials/tag.html",
	"tpl!/templates/partials/tags.html",
	"tpl!/templates/partials/notification.html",
	"tpl!/templates/partials/popup.html",
	"tpl!/templates/partials/spotify-search.html",

	"tpl!/templates/stream.html",
	"tpl!/templates/friends.html",
	"tpl!/templates/tracks.html",
	"tpl!/templates/direct-message.html",
	"tpl!/templates/friends-notification.html",
	"tpl!/templates/all-friends-notification.html",
	"tpl!/templates/wall-post.html",

	"jquery.toggleloading",
	"jquery.transition",
	"underscore",
	"facebook",
	"helpers"
], function ($, renderTag, renderTags, renderNotification, renderPopup, renderSpotifySearch, renderStream, renderFriends, renderTracks, renderDirectMessage, renderFriendsNotification, renderAllFriendsNotification, renderWallPost) {

	var SongTag = {

		Initialize: {

			canvas: function () {

				var stream, search, user = {}, postToFacebook = true;

				var keyCodes = {
					enter: 13,
					escape: 27,
					up: 38,
					down: 40
				};

				var $body, $stream, $friends, $allFriends, $popups, $notifications;

				var initialize = function () {

					$(document).ready(function () {
						$window = $(window);
						$body = $('body');
						$stream = $('.stream');
						$friends = $('.friends');
						$allFriends = $('.all-friends');
						$popups = $('.popups');
						$notifications = $('.notifications');

						$body.on('instantSearch', '.spotify-search', function (event, query) {
							$this = $(this);

							$this.trigger('spotifySearch', [query]);
						});
						$body.on('clearSearch', '.js-search', function () {
							var $this = $(this);

							$this.find('.results-list').hide();
						});
						$body.on('spotifySearch', '.spotify-search', function (event, query) {
							var $this = $(this);

							search = $.getJSON('http://ws.spotify.com/search/1/track.json', { q: query }, function (results) {
								$this.find('.results-list').empty().append(renderTracks({
									tracks: results.tracks.splice(0, 5)
								})).show();

								$this.find('.results-list-item').first().mouseover();
							});
						});
						$body.on('renderTag', '.facebook-object, .wall-post', function (event, $selectedResult) {
							var $this = $(this);
							var $tag;

							$selectedResult = $selectedResult ? $selectedResult : $this.find('.results-list-item.is-selected');

							var tag = {
								incomplete: true,
								type: "one",
								tracks: {
									uris: []
								},
								track: {
									uri: $selectedResult.data('uri'),
									href: 'http://open.spotify.com/track/' + $selectedResult.data('uri').split(':').pop(),
									name: $selectedResult.find('.spotify-track-name').text(),
									artist: $selectedResult.find('.spotify-track-artist').text()
								},
								post: {
									id: $this.data('id')
								},
								user: {
									from: user,
									to: {
										name: $this.find('.facebook-name').text()
									}
								}
							};

							$this.trigger('clearSearch');

							// if ($facebookObject.hasClass('popups-item')) {
							// 	var previousTag;

							// 	$tag = $facebookObject.find('.tags-list-item');

							// 	if (previousTag = $tag.data('tag')) {
							// 		switch(previousTag.type) {
							// 			case "one":

							// 				tag.type = "many";
							// 				tag.tracks.uris.push(tag.track.uri.split(':').pop(), previousTag.track.uri.split(':').pop());

							// 			break;
							// 			case "many":
							// 				console.log(tag);
							// 				console.log(tag.track_uri.split(':').pop());
							// 				// previousTag.tracks.uris.push(tag.track_uri.split(':').pop());

							// 				tag = previousTag;
							// 			break;
							// 		}
							// 	}
							// }

							$tag = $(renderTag({
								tag: tag,
								user: user
							}));

							$tag.data('tag', tag);

							$tag.appendTo($this.find('.tags-list'));

							$this.trigger('goToAndFocus', [$tag.find('.facebook-form-field')]);

							$tag.hide().slideDown();
						});
						$body.on('goToAndFocus', '.facebook-object, .wall-post', function (event, $focusField) {
							var $this = $(this);

							if ($this.hasClass('stream-item')) {
								var y = $this.offset().top;

								scrollTo(y, 200);

								$('html, body').animate({ scrollTop: y }, 200, function () {
									$focusField.focus();
								});
							} else {
								$focusField.focus();
							}
						});
						$body.on('submit', '.js-form', function (event) {
							event.preventDefault();
						});
						$body.on('submit', '.facebook-object .spotify-search', function () {
							var $this = $(this);
							var $selectedResult = $this.find('.results-list-item.is-selected');

							if (!$selectedResult.length) {
								return;
							}

							$this.trigger('renderTag');
						});
						$body.on('submit', '.js-message-form', function () {
							var $this = $(this);
							var $tag = $this.parents('.tags-list-item');

							var tag = $tag.data('tag');

							tag.message = $(this).serializeArray().pop().value;

							$this.trigger('saveTag', [tag]);
						});
						$body.on('keydown', function (event) {
							var $this = $(this);
							var $notificationsItem = $notifications.find('.notifications-item');

							if (event.keyCode === keyCodes.escape) {
								$notificationsItem.trigger('removeNotification');
							}
						});
						$body.on('keydown', '.js-search', function (event) {
							var $this = $(this);
							var $selectedResult = $this.find('.results-list-item.is-selected');

							if ($.inArray(event.keyCode, [keyCodes.up, keyCodes.down]) === -1) {
								return;
							}

							event.preventDefault();
							event.stopPropagation();

							switch (event.keyCode) {
								case keyCodes.up:
									$selectedResult.prevAll(':visible').first().mouseover();
								break;
								case keyCodes.down:
									$selectedResult.nextAll(':visible').first().mouseover();
								break;
							}
						});
						$body.on('keydown', '.js-message-form', function (event) {
							var $this = $(this);

							switch (event.keyCode) {
								case keyCodes.enter:
									if (!event.shiftKey) {
										event.preventDefault();

										$this.submit();
									}
								break;
								case keyCodes.escape:
									event.preventDefault();
									event.stopPropagation();

									$this.find('input.cancel').click();
								break;
							}
						});
						$body.on('keyup focus', '.js-search', function (event) {
							var $this = $(this);

							var query = $(event.target).val();

							if ($.inArray(event.keyCode, [keyCodes.escape, keyCodes.up, keyCodes.down, keyCodes.enter]) !== -1) {
								return;
							}

							if (!query.length) {
								$this.trigger('clearSearch');
								return;
							}

							if (search) {
								search.abort();
							}

							$this.trigger('instantSearch', [query]);
						});
						$body.on('blur', '.js-search', function () {
							var $this = $(this);

							setTimeout(function () {
								$this.trigger('clearSearch');
							}, 100);
						});
						$body.on('click', '.logo', function (event) {
							if ($window.scrollTop() > 100) {
								event.preventDefault();
								
								$('html, body').animate({ scrollTop: 0 }, 200);
							}
						});
						$body.on('click', '.js-message-form input.cancel', function (event) {
							var $this = $(this);
							var $facebookObject = $this.parents('.facebook-object');
							var $activeTag = $this.parents('.tags-list-item');

							event.preventDefault();

							$facebookObject.trigger('goToAndFocus', [$facebookObject.find('.spotify-form-field')]);

							$activeTag.slideUp(function () {
								$activeTag.remove();
							});
						});
						$body.on('mousedown', '.results-list-item', function () {
							var $this = $(this);

							$this.trigger('submit');
						});
						$body.on('mouseover', '.results-list-item', function () {
							var $this = $(this);

							$this.addClass('is-selected').siblings().removeClass('is-selected');
						});

						$stream.on('loadStream', function (event, firstLoad, offsetTime) {
							$stream.find('.posts').toggleLoading();
							$stream.find('input.load-more-button').attr('disabled', 'disabled').val('Loading…');

							FB.api({
								method: 'fql.multiquery',
								queries: {
									'query0': "SELECT post_id, actor_id, source_id, target_id, message, attachment, action_links, message_tags, description, description_tags, type, created_time, comments FROM stream WHERE filter_key in (SELECT filter_key FROM stream_filter WHERE uid = me() AND type = 'newsfeed') AND is_hidden = 0 AND type IN ('247', '46', '80')" + (offsetTime ? " AND created_time < " + offsetTime + " " : "") + "ORDER BY created_time DESC",
									'query1': "SELECT uid, name FROM user WHERE uid IN (SELECT actor_id FROM #query0)",
									'query2': "SELECT page_id, name FROM page WHERE page_id IN (SELECT actor_id FROM #query0)",
									'query3': "SELECT gid, name FROM group WHERE gid IN (SELECT actor_id FROM #query0)",
									'query4': "SELECT eid, name FROM event WHERE eid IN (SELECT actor_id FROM #query0)",
									'query5': "SELECT uid, name FROM user WHERE uid IN (SELECT target_id FROM #query0)",
									'query6': "SELECT page_id, name FROM page WHERE page_id IN (SELECT target_id FROM #query0)",
									'query7': "SELECT gid, name FROM group WHERE gid IN (SELECT target_id FROM #query0)",
									'query8': "SELECT eid, name FROM event WHERE eid IN (SELECT target_id FROM #query0)"
								}
							}, function (response) {
								console.log(response);
								var actors = response[1].fql_result_set.concat(response[2].fql_result_set, response[3].fql_result_set, response[4].fql_result_set);
								var targets = response[5].fql_result_set.concat(response[6].fql_result_set, response[7].fql_result_set, response[8].fql_result_set);

								stream = response[0].fql_result_set;

								console.log(response);

								_.each(stream, function (story) {
									_.each(actors, function (actor) {
										if (actor.uid === story.actor_id || actor.page_id === story.actor_id || actor.uid === story.actor_id || actor.gid === story.actor_id || actor.eid === story.actor_id) {
											story.actor_name = actor.name;
										}
									});

									_.each(targets, function (target) {
										if (target.uid === story.target_id || target.page_id === story.target_id || target.uid === story.target_id || target.gid === story.target_id || target.eid === story.target_id) {
											story.target_name = target.name;
										}
									});

									if (story.description) {
										story.description = story.description.replace(story.actor_name, "");

										_.each(story.description_tags, function (description_tag) {
											story.description = story.description.replace(description_tag[0].name, '<a class="facebook-link" href="//facebook.com/' + description_tag[0].id + '" target="_blank">' + description_tag[0].name + '</a>');
										});
									}

									if (story.message) {
										_.each(story.message_tags, function (message_tag) {
											story.message = story.message.replace(message_tag[0].name, '<a class="facebook-link" href="//facebook.com/' + message_tag[0].id + '" target="_blank">' + message_tag[0].name + '</a>');
										});
										
										story.message = story.message.replace(/\n/g, '<br>');
									}
								});

								if (firstLoad === true) {
									// Removes loading messages
									$stream.find('.posts').empty();
									$stream.find('input.load-more-button').show();

									FB.Canvas.setDoneLoading();
								}

								$stream.trigger('renderStream');

								$stream.find('.posts').toggleLoading();
								$stream.find('input.load-more-button').removeAttr('disabled').val('Load more');
							});
						});
						$stream.on('renderStream', function () {
							var posts = [];

							_.each(stream, function (story) {
								posts.push(story.post_id);
							});

							$.get('/api/tags', { posts: posts }, function (tags) {
								// Join the found tags with the correct news feed items
								_.each(stream, function (story) {
									_.each(tags, function (tag) {
										if (tag.post_id === story.post_id) {
											if (!story.tags) {
												story.tags = [];
											}

											story.tags.push({
												id: tag.id,
												message: tag.message,
												type: tag.type,
												tracks: {
													uris: tag.tracks_uris ? tag.tracks_uris.split(',') : []
												},
												track: {
													uri: tag.track_uri,
													name: tag.track_name,
													artist: tag.track_artist
												},
												post: {
													id: tag.post_id
												},
												user: {
													from: {
														id: tag.user_id,
														name: tag.user_name
													}
												}
											});
										}
									});
								});

								$stream.find('.posts').append(renderStream({
									stream: stream,
									user: user
								}));
							});
						});
						$stream.on('instantSearch', '.stream-item', function (event, query) {
							$this = $(this);

							$stream.addClass('is-searching');
							$this.addClass('is-active');
						});
						$stream.on('clearSearch', '.stream-item', function () {
							$this = $(this);

							$stream.removeClass('is-searching');
							$this.removeClass('is-active');
						});
						$stream.on('saveTag', '.tags-list-item', function (event, tag) {
							var $this = $(this);

							$.post('/api/tag', { tag: tag }, function (response) {
								$this.data('tag', tag = response);

								tag.incomplete = false;

								$this.replaceWith(renderTag({
									tag: tag,
									user: user
								}));
							});

							// Quick switch for easy disabling when testing
							if (postToFacebook === true) {
								// Object ID is used for comments where it is available
								FB.api('/' + ($this.data('object-id') ? $this.data('object-id') : tag.post.id) + '/comments', 'post', {
									message: (tag.message ? tag.message + " " : "") + tag.track.href + " - Song tagged with SongTag. "
								}, function (response) {
									console.log('comment response', response);
								});
							}

							FB.api('/me/songtag:tag', 'POST', {
								song: "http://songtagapp.com/api/track/" + tag.track.name + "/" + tag.track.artist
							}, function (response) {
								console.log('open graph response', response);
							});
						});
						$stream.on('deleteTag', '.tags-list-item', function () {
							var $tagsListItem = $(this);

							$.ajax({
								url: '/api/tag/' + $tagsListItem.data('id'),
								type: 'DELETE',
								success: function (response) {
									console.log('deleted', response);
								}
							});

							$tagsListItem.slideUp();
						});
						$stream.on('click', 'input.load-more-button', function () {
							var $this = $(this);

							if (stream.length) {
								$stream.trigger('loadStream', [false, stream.pop().created_time]);
							} else {
								$stream.find('.load-more-button').hide();
							}
						});
						$stream.on('click', '.icon-remove', function () {
							var $tagsListItem = $(this).parents('.tags-list-item');
							var $facebookObject = $tagsListItem.parents('.facebook-object');

							$tagsListItem.trigger('deleteTag');
						});

						$friends.on('instantSearch', function (event, query) {
							var $results = $friends.find('.results-list-item').filter(function () {
								return $(this).find('.facebook-name').text().toLowerCase().search(query.toLowerCase()) !== -1;
							}).slice(0, 7);

							if (!$results.length) {
								$friends.trigger('clearSearch');
								return;
							}

							$friends.find('.results-list').show();

							$results.show();
							$results.first().mouseover();

							$friends.find('.results-list-item').not($results).hide();
						});
						$friends.on('submit', function () {
							var $this = $(this);
							var $selectedResult = $this.find('.results-list-item.is-selected');

							var $directMessage = $(renderDirectMessage({
								user: {
									from: user,
									to: {
										id: $selectedResult.data('id'),
										name: $selectedResult.text()
									}
								}
							}));

							$popups.trigger('addPopup', [$directMessage]);

							$directMessage.find('.spotify-form-field').focus();
						});

						$allFriends.on('submit', function () {
							var $this = $(this);
							var $selectedResult = $this.find('.results-list-item.is-selected');

							var $wallPost = $(renderWallPost({
								user: {
									from: user
								}
							}));

							$popups.trigger('addPopup', [$wallPost]);

							$wallPost.trigger('renderTag', [$selectedResult]);
						});

						$popups.on('addPopup', function (event, $popupsItem) {
							$popups.show(0, function () {
								$popups.addClass('visible');

								$popupsItem.prependTo($popups);

								$popupsItem.addClass('is-active');
								$popupsItem.css('top', (parseInt($popupsItem.outerHeight(true), 10) + parseInt($popups.css('paddingTop'), 10)) * -1);
								$popupsItem.animate({
									top: 0
								}, 300);
							});
						});
						$popups.on('removePopup', '.popups-item', function (event, success) {
							var $popupsItem = $(this);

							var top = success ? (parseInt($popupsItem.outerHeight(true), 10) + parseInt($popups.css('paddingTop'), 10)) * -1 : parseInt($window.height(), 10) - parseInt($popups.css('paddingTop'), 10);

							$popups.removeClass('visible');

							$popupsItem.animate({
								top: top
							}, 300, function () {
								$popupsItem.remove();
								$popups.hide(0);
							});
						});
						$popups.on('instantSearch', '.facebook-object .js-search', function (event, query) {
							$this = $(this);

							$this.trigger('spotifySearch', [query]);
						});
						$popups.on('saveTag', '.facebook-object .tags-list-item', function () {
							var $this = $(this);
							var $facebookObject = $this.parents('.facebook-object');
							var $popupsItem = $this.parents('.popups-item');

							var tag = $this.data('tag');

							$facebookObject.toggleLoading();

							if (postToFacebook === true) {
								FB.api('/' + tag.post.id + '/feed', 'post', {
									message: tag.message,
									link: tag.track.href
								}, function (response) {
									console.log('post to wall', response);

									$facebookObject.toggleLoading();

									$popupsItem.trigger('removePopup', [true]);

									$notifications.trigger('addNotification', [$(renderFriendsNotification({
										tag: tag
									}))]);
								});
							} else {
								setTimeout(function () {
									$facebookObject.toggleLoading();

									$popupsItem.trigger('removePopup', [true]);

									$notifications.trigger('addNotification', [$(renderFriendsNotification({
										tag: tag
									}))]);
								}, 200);
							}
						});
						$popups.on('saveTag', '.wall-post .tags-list-item', function () {
							var $this = $(this);
							var $facebookObject = $this.parents('.facebook-object');
							var $popupsItem = $this.parents('.popups-item');

							var tag = $this.data('tag');

							$facebookObject.toggleLoading();

							if (postToFacebook === true) {
								FB.api('/' + tag.user.from.id + '/feed', 'post', {
									message: tag.message,
									link: tag.track.href
								}, function (response) {
									console.log('post to own wall', response);

									$facebookObject.toggleLoading();

									$popupsItem.trigger('removePopup', [true]);

									$notifications.trigger('addNotification', [$(renderAllFriendsNotification({
										tag: tag
									}))]);
								});
							} else {
								setTimeout(function () {
									$facebookObject.toggleLoading();

									$popupsItem.trigger('removePopup', [true]);

									$notifications.trigger('addNotification', [$(renderAllFriendsNotification({
										tag: tag
									}))]);
								}, 200);
							}
						});
						$popups.on('keydown', '.popups-item', function (event) {
							var $this = $(this);

							switch (event.keyCode) {
								case keyCodes.escape:
									$this.trigger('removePopup');
								break;
							}
						});
						$popups.on('submit', '.facebook-object .js-search', function () {
							var $this = $(this);
							var $facebookObject = $this.parents('.facebook-object');
							var $activeTag = $facebookObject.find('.tags-list-item');

							$activeTag.slideUp(function () {
								$activeTag.remove();
							});
						});
						$popups.on('click', '.wall-post .js-message-form input.cancel', function (event) {
							var $this = $(this);
							var $wallPost = $this.parents('.wall-post');

							$wallPost.trigger('removePopup');
						});
						$popups.on('click', function (event) {
							var $eventTarget = $(event.target);
							var $popupsItem = $(this).find('.popups-item');

							if ($eventTarget.hasClass('popups') || $eventTarget.hasClass('icon-remove')) {
								$popupsItem.trigger('removePopup');
							}
						});

						$notifications.on('addNotification', function (event, $notificationsItem) {
							$notificationsItem.prependTo($notifications);

							$notificationsItem.css({
								opacity: 0,
								marginTop: parseInt($notificationsItem.outerHeight(), 10) * -1
							});
							$notificationsItem.animate({
								opacity: 1,
								marginTop: 0
							}, 300, function () {
								$notificationsItem.trigger('setTimer');
							});
						});
						$notifications.on('removeNotification', '.notifications-item', function (event) {
							var $notificationsItem = $(this);

							$notificationsItem.animate({
								opacity: 0,
								marginTop: parseInt($notificationsItem.outerHeight(), 10) * -1
							}, 300, function () {
								$notificationsItem.remove();
							});
						});
						$notifications.on('clearNotifications', function () {
							$notifications.find('.notifications-item').each(function () {
								var $notificationsItem = $(this);

								$notificationsItem.trigger('removeNotification');
							});
						});
						$notifications.on('setTimer', '.notifications-item', function () {
							var $notificationsItem = $(this);

							$notificationsItem.data('timer', setTimeout(function () {
								$notificationsItem.trigger('removeNotification');
							}, 5000));
						});
						$notifications.on('clearTimer', '.notifications-item', function () {
							var $notificationsItem = $(this);

							clearTimeout($notificationsItem.data('timer'));
						});
						$notifications.on('click', '.icon-remove', function () {
							var $notificationsItem = $(this).parents('.notifications-item');

							$notificationsItem.trigger('removeNotification');
						});
						$notifications.on('mouseenter', '.notifications-item', function () {
							var $notificationsItem = $(this);

							$notificationsItem.trigger('clearTimer');
						});
						$notifications.on('mouseleave', '.notifications-item', function () {
							var $notificationsItem = $(this);

							$notificationsItem.trigger('setTimer');
						});

						FB.getLoginStatus(function (response) {
							if (response.status === "connected") {
								FB.api('/me', function (response) {
									user = {
										id: response.id,
										name: response.name
									};
								});

								$stream.trigger('loadStream', [true]);

								FB.api('/me/friends', function (response) {
									$friends.find('.results-list').append(renderFriends({ friends: response.data }));
								});
							}
						});
					});

				}();

			}

		}

	};

	return SongTag.Initialize;

});