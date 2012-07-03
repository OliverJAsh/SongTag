function scrollTo(y, duration) {
	FB.Canvas.getPageInfo(function (pageInfo) {
		$({ y: pageInfo.scrollTop }).animate(
			{
				y: y
			},
			{
				duration: duration,
				step: function (offset) {
					FB.Canvas.scrollTo(0, offset);
				}
			}
		);
	});
}