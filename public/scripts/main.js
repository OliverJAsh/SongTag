require.config({
	paths: {
		"facebook": "https://connect.facebook.net/en_US/all",
		"jquery": "libs/jquery",
		"underscore": "libs/underscore",
		"tpl": "libs/tpl",
		"text": "libs/text",
		"jquery.toggleloading": "libs/jquery.toggleloading",
		"jquery.transition": "libs/jquery.transition"
	}
});

require([
	"app",
	"jquery",
	"facebook"
], function (Initialize, $) {
	_.templateSettings.encode = /<%==([\s\S]+?)%>/g;
	_.extend(_, {
		// Taken from Backbone.js's escapeHTML()
		escape: function(string) {
				return (''+string).replace(/&(?!\w+;|#\d+;|#x[\da-f]+;)/gi, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
		},
		template: function(str, data) {
			var c  = _.templateSettings;
			var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
				'with(obj||{}){__p.push(\'' +
				str.replace(/\\/g, '\\\\')
					.replace(/'/g, "\\'")
					.replace(c.encode, function(match, code) {
						return "',_.escape(" + code.replace(/\\'/g, "'") + "),'";
					})
					.replace(c.interpolate, function(match, code) {
						return "'," + code.replace(/\\'/g, "'") + ",'";
					})
					.replace(c.evaluate || null, function(match, code) {
						return "');" + code.replace(/\\'/g, "'")
							.replace(/[\r\n\t]/g, ' ') + "__p.push('";
					})
					.replace(/\r/g, '\\r')
					.replace(/\n/g, '\\n')
					.replace(/\t/g, '\\t')
					+ "');}return __p.join('');";
			var func = new Function('obj', tmpl);
			return data ? func(data) : func;
		}
	});

	FB.init({
		appId: '294833607242566',
		status: true,
		cookie: true,
		xfbml: true,
		oauth: true
	});

	FB.Canvas.setAutoGrow();

	$('.facebook-login-button').on('click', function () {
		window.location.pathname += "login";
	});

	Initialize.canvas();
});