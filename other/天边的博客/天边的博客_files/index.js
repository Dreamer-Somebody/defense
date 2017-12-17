jQuery(document).ready(function($) {
	$("div#pic a").click(function(event) {
		event.preventDefault();
		$number = Math.ceil(Math.random()*12);
		$img = $("div#pic").find('img');
		$img.addClass('hide');
		setTimeout(function(){
			$img.attr('src', '/blog/img/headPic/'+$number+'.jpg');
			$img.removeClass('hide');
		},1000);
	});
});