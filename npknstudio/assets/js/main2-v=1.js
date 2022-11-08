$(function(){
	$('[data-target-page]').on('click', function(){
		var $a = $('a').attr('href', $(this).data('target-page'));
		window.location = $a.attr('href');
	});
});