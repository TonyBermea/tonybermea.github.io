window.initWoWGradient = function($wowGradient){
  var tl = new TimelineMax({
    repeat: -1,
    yoyo : true
  });


  // create an object to store initial color values
  var colors = {
    blue: 'rgba(89,170,249,1)',
    green: 'rgba(110,237,216,1)',
    purple : 'rgba(141,75,206,1)'
  };

  var targetColor = {
    color : colors.blue
  }; 

  // use ColorPropsPlugin to tween the top and bottom colors
  tl
  .to(targetColor, 5, {
    colorProps: {
      color: colors.green
    },
    ease : Power2.easeInOut,
    onUpdate: colorize
  })
  .to(targetColor, 5, {
    colorProps: {
      color: colors.purple
    },
    ease : Power2.easeInOut,
    onUpdate: colorize
  })
  .to(targetColor, 5, {
    colorProps: {
      color: colors.blue
    },
    ease : Power2.easeInOut,
    onUpdate: colorize
  })
  .yoyo();

  function colorize() {
    var transparentColor = targetColor.color.replace(',1)', ',0)');
    TweenLite.set($wowGradient, {
      background: `radial-gradient(circle at 50% 213%, ${targetColor.color} 0%, ${targetColor.color} 40%, ${transparentColor} 88%, ${transparentColor} 100%)`
    });
  }

  $wowGradient.data('wowGradientTl', tl);
  $wowGradient.data('clearWowGradient', function(){
    tl.kill();
  });
};


$(function(){
  var $wowGradient = $('.wow-gradient');

  if (!$wowGradient.length){
    return;
  }

  window.initWoWGradient($wowGradient);
});