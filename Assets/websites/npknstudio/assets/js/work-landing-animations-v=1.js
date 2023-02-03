$(function(){
  var scrollMagicController = new ScrollMagic.Controller();

  $('[data-animation-style="work-landing"]').each(function(){
    
    var $caseStudiesLanding = $(this);
    
    var caseStudiesLandingScrollController = {};
    caseStudiesLandingScrollController.triggerHook = .25;
    
    var $window = $(window);
    
    var $caseStudies = $caseStudiesLanding.find('.case-study');
    var $backgroundVisuals = $caseStudiesLanding.find('#background-visuals');


    var tl = new TimelineMax();
    tl.staggerFromTo($caseStudiesLanding.find('.h1'), 1, {
      y: '100%',
      opacity: 0
    }, {
      y : '0%',
      opacity : 1,
      ease: Power4.easeInOut
    }, 0.03);
    
    var scene = new ScrollMagic.Scene({
      reverse: false,
      triggerElement : this,
      triggerHook : .75
    });
    scene.setTween(tl)
    .addTo(scrollMagicController);


  //   $caseStudies.each(function(){

  //     var $caseStudy = $(this);
      
  //     // Get things ready
  //     // Store original height
  //     $caseStudy.data({
  //       'originalMaxHeight' : $caseStudy.css('max-height'),
  //       'offsetTop' : $caseStudy.offset().top
  //     });

  //     var caseStudyTl = new TimelineMax({paused: true});
      
  //     caseStudyTl.addLabel('start')
      
  //     .set($caseStudy.find('a'), { 'className' : '+=underline-link'})
      

  //     .to(window, 1, {
  //         scrollTo:{
  //           y: , 
  //           autoKill:false
  //         }
  //       },
  //       ease: Power4.easeInOut
  //     }),
  //     .to($caseStudy, 1, {
  //       'max-height' : '20rem',
  //       ease: Power4.easeInOut
  //     }, 'start')

  //     .to($caseStudy.find('.h1'), 1, {
  //       'margin-top' : '2rem'
  //     }, 'start')
  //     .to($caseStudy.find('.tagline'), 1, {
  //       opacity : 1,
  //       ease: Power4.easeInOut
  //     }, 'start')
      
  //     .addLabel('backgroundVisuals', 'start')
      
  //     .to($backgroundVisuals.find('.slide-bg-right'), .3, {
  //       opacity : 0,
  //       ease: Power4.easeInOut
  //     }, 'start')
  //     .call(function(){
        
  //       var $background = $backgroundVisuals.find('.manifesto-background');
  //       if ($caseStudy.data('case-study-background-style') === 'image'){
  //         $background
  //         .removeClass('wow-gradient')
  //         .css({
  //           'backgroundImage' : 'url(' + $caseStudy.data('case-study-background-image') + ')'
  //         });
  //         if ($background.data('clearWowGradient')){ $background.data('clearWowGradient')(); }
  //       } else {
  //         $background
  //         .addClass('wow-gradient')
  //         .css({
  //           'backgroundImage' : 'none'
  //         });
  //         window.initWoWGradient($background);
  //       }
  //     })
  //     .to($backgroundVisuals.find('.slide-bg-right'), .5, {
  //       opacity : 1,
  //       ease: Power4.easeInOut
  //     })
  //     ;
      


  //     var closeDuration = 1;
  //     var closeCaseStudyTl = new TimelineMax({paused:true});
      
  //     closeCaseStudyTl.addLabel('start')
      
  //     .to($caseStudy, closeDuration, {
  //       'max-height' : $caseStudy.data('originalMaxHeight'),
  //       ease: Power4.easeInOut
  //     }, 'start')
  //     .to($caseStudy.find('.h1'), closeDuration, {
  //       'margin-top' : '0',
  //       ease: Power4.easeInOut
  //     }, 'start')
  //     .to([
  //         $caseStudy.find('.tagline')
  //       ], closeDuration/2, {
  //       opacity: 0,
  //       ease: Power4.easeInOut
  //     }, 'start')
      
      
  //     $caseStudy.data('openTimeline', caseStudyTl);
  //     $caseStudy.data('closeTimeline', closeCaseStudyTl);
  //   });

    
  //   var prevScrollTop = 0;
  //   $window.on('scroll', function(){
  //     var height = $window.height();
  //     var scrollTop = $window.scrollTop();
  //     var topTrigger = $backgroundVisuals.offset().top;
  //     var scrollDirection = scrollTop > prevScrollTop ? 'up' : 'down';

  //     var $activeCaseStudy = getActiveCaseStudy();
  //     var activeIndex = $caseStudies.index($activeCaseStudy);

  //     var hasPrev = false,
  //         $prevCaseStudy;
  //     if (activeIndex > 0){
  //       hasPrev = true;
  //       $prevCaseStudy = $caseStudies.eq(activeIndex - 1);
  //     }

  //     console.log('scrollDirection', scrollDirection);
  //     console.log('activeIndex', activeIndex);

  //     // If up, and active.offsetTop is now < topTrigger, collapse it and activate its next sibling
  //     // If down, and active.prevSibling.offsetTop is now < topTrigger, collapse active and activate prevSibling
  //     if (scrollDirection === 'up'){
  //       if ($activeCaseStudy.find('.h1').offset().top < topTrigger && $caseStudies.length > activeIndex){
  //         $activeCaseStudy.data('closeTimeline').restart();
  //         activateCaseStudyIndex(activeIndex + 1);
  //       } 
  //     } else {
  //       if (hasPrev && $prevCaseStudy.find('.h1').offset().top > topTrigger){
  //         $activeCaseStudy.data('closeTimeline').restart();
  //         activateCaseStudyIndex(activeIndex - 1);
  //       }
  //     }

  //     // When activating a new one, scroll page to right position
      
  //     $caseStudies.each(function(index){
  //       var $caseStudy = $(this);
  //       var caseStudyOffsetTop = $caseStudy.offset().top;
  //       console.log($caseStudy.data('case-study-id'), caseStudyOffsetTop, topTrigger, scrollTop);
  //     })
  //     console.log('');

  //     prevScrollTop = scrollTop;
  //   });

  //   var getActiveCaseStudy = function(){
  //     return $caseStudies.filter(function(){
  //       return $(this).data('isActive');
  //     });
  //   };

  //   var activateCaseStudyIndex = function(index){
  //     $caseStudies.data('isActive', false);
  //     $caseStudies.find('a').removeClass('underline-link');

  //     var $caseStudy = $caseStudies.eq(index);
  //     $caseStudy.data('isActive', true);
  //     $caseStudy.data('openTimeline').play();
  //   }
  //   setTimeout(function(){
  //     activateCaseStudyIndex(0);
  //   }, 1000);
     

  });  
});