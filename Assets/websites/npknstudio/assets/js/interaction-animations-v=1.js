$(function(){
	$('[data-animate-letter-on-hover]').each(function(){
		var $this = $(this),
			$target = $this.find('[data-animate-letter-target]'),
			rate = 120;
		
		$this.data('initialLetter', $target.text());
		
		var swapToNextLetter = function(){
			$target.text($this.data('remainingLetters').shift());

			if ($this.data('remainingLetters').length){

			} else {
				$this.data('remainingLetters', $this.data('animate-letter-on-hover').split(''));
			}

			$this.data('letterSwapTimeout', setTimeout(swapToNextLetter, rate));
		}

		var start = function(){
			if ($this.data('isAnimatingFullText')){
				return;
			}
			$this.data('remainingLetters', $this.data('animate-letter-on-hover').split(''));
			$this.data('letterSwapTimeout', setTimeout(swapToNextLetter, rate));
			$this.data('isAnimatingFullText', true);
		};

		var reset = function(){
			clearTimeout($this.data('letterSwapTimeout'));
			$target.text($this.data('initialLetter'));
			$this.data('isAnimatingFullText', false);
			
			// var tl = new TimelineMax();
			// tl.fromTo($target, 0, {
			// 	alpha : 1
			// }, 
			// {
			// 	alpha : 0,
			// 	ease: Power4.easeInOut
			// })
			// .call(function(){
			// 	$target.text($this.data('initialLetter'));
			// })
			// .set($target, {
			// 	y : '50%'
			// })
			// .to($target, .3, {
			// 	y : '0%',
			// 	alpha : 1,
			// 	ease: Power4.easeInOut
			// })
			// .call(function(){
			// 	$this.data('isAnimatingFullText', false);
			// });
		};

		$this.on('mouseenter', start);
		$this.on('mouseleave', reset);	
	});
});