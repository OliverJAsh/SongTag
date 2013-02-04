# SongTag – Web App

You can [view this app live here](http://songtagapp.com/). My first client-side heavy web app, which I made in my second year at university. I was trying to learn Backbone.js at the time, but I had to settle for writing the whole thing without any frameworks. Now that I can get my head around such frameworks, I no longer wish to maintain a JavaScript file that has 700+ LOC, so I have released the source code instead.

## Table SQL

    CREATE TABLE `tags` (
      `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
      `message` text,
      `type` text,
      `post_id` text,
      `user_id` text,
      `user_name` text,
      `tracks_uris` text,
      `track_uri` text,
      `track_name` text,
      `track_artist` text,
      PRIMARY KEY (`id`)
    ) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
