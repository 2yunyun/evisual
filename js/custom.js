$(function() {
		var myPlayer = videojs('my-video');
		$(".video_link").click(function() {
			var videoUrl = $(this).attr("videohref");
			var videoType = $(this).attr("videoType");
			$(".videoPlayWrap").addClass('active');
			videojs("my-video", {}, function() {
				window.myPlayer = this;
				$(".videoPlayWrap video source").attr("src", videoUrl);
				$(".videoPlayWrap video source").attr("type", videoType);

				myPlayer.src(videoUrl);
				myPlayer.load(videoUrl);
				myPlayer.play();
			});
		});

		$('.closeVideo').on('click',function(){
			myPlayer.pause();
			$(".videoPlayWrap").removeClass('active');
		});

})