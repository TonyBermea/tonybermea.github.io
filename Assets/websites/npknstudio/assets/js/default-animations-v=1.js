$(function(){
  var scrollMagicController = new ScrollMagic.Controller();

  // Grab each thing that needs to animate on appearance.
  // Create a ScrollMagic scene. Trigger is the container element,
  // with maybe some negative offset. Add it to the controller.

  $('.mobile-nav .btn-trigger-nav').on('click', function(){
    var $btn = $(this),
        $nav = $btn.closest('.mobile-nav'),
        $items = $nav.find('.mobile-nav-items');

    var tl = new TimelineMax();
    
    if ($nav.attr('data-state') === 'closed'){
      $nav.attr('data-state', 'open');
      tl.to($items, .5, {
        'max-height' : ($items.find('li').length - 1) * 2 + 1 + 'em',
        ease: Power4.easeInOut
      });  
    } else {
      $nav.attr('data-state', 'closed');
      tl.to($items, .5, {
        'max-height' : '0',
        ease: Power4.easeInOut
      });
    }
  });

  $('.latest-top-row').each(function(){
    var $el = $(this);

    var tl = new TimelineMax();
    tl.staggerFromTo($el.find('.unit-text'), 1, {
      y: '100%',
      opacity: 0
    }, {
      y : '0%',
      opacity : 1,
      ease: Power4.easeInOut
    }, 0.1);
    
    var scene = new ScrollMagic.Scene({
      reverse: false,
      triggerElement : this,
      triggerHook : .75
    });
    scene.setTween(tl)
    .addTo(scrollMagicController);
  });

  $('.strip-section-header').each(function(){
      var $el = $(this);

      var tl = new TimelineMax();
      tl.staggerFromTo($el.find('.section-id,.section-title,.section-description'), 1, {
       y: '100%',
       opacity: 0
     }, {
       y : '0%',
       opacity : 1,
       ease: Power4.easeInOut
     }, 0.03, 'start')
      
      var scene = new ScrollMagic.Scene({
        reverse: false,
        triggerElement : this,
        triggerHook : .95
      });
      scene.setTween(tl)
      .addTo(scrollMagicController);
    });


  $('.row:not(.latest-top-row)').each(function(){
      var $el = $(this);

      var tl = new TimelineMax();
      tl.addLabel('start')
      tl.staggerFromTo($el.find('.slide,.slide-bg,.slide-visual'), 1, {
       y: '100%',
       opacity: 0
     }, {
       y : '0%',
       opacity : 1,
       ease: Power4.easeInOut
     }, 0.03, 'start')
      .call(function(){
        $el.find('.inline-video').each(function(){
          try {
            this.play();
          } catch(e){
            console.log(e);
          }
        });
      })
      .staggerFromTo($el.find('.unit-initial,.unit-image-title'), 1, {
       y: '50%',
       opacity: 0
     }, {
       y : '0%',
       opacity : 1,
       ease: Power4.easeInOut
     }, 0.03, 'start+=.6')

      .fromTo($el.find('.unit-image-desc'), 1, {
       opacity: 0
     }, {
       opacity : 1,
       ease: Power4.easeInOut
     }, '-=.6')

      var scene = new ScrollMagic.Scene({
        reverse: false,
        triggerElement : this,
        triggerHook : .95
      });
      scene.setTween(tl)
      .addTo(scrollMagicController);
    }); 

  $('[data-animation-style="default"]').each(function(){
    var $defaultAnimations = $(this);
    
    $defaultAnimations.find('.strip-manifesto').each(function(){
      var $el = $(this);

      var tl = new TimelineMax();
      tl.staggerFromTo($el.find('.unit-visual,.h1'), 1, {
        y: '100%',
        opacity: 0
      }, {
        y : '0%',
        opacity : 1,
        ease: Power4.easeInOut
      }, 0.1);
      
      var scene = new ScrollMagic.Scene({
        reverse: false,
        triggerElement : this,
        triggerHook : .95
      });
      scene.setTween(tl)
      .addTo(scrollMagicController);
    });


    


    
  });

});


