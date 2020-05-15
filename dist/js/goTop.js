$(function() {
    $(window).scroll(function() {
        if ($(window).scrollTop() >= 100) {
            $('.actGotop').fadeIn(300);
        } else {
            $('.actGotop').fadeOut(300);
        }
    });
    $('.actGotop').click(function() {
        $('html,body').animate({
            scrollTop: '0px'
        }, 800);
    });


// 模块出现时机
$('.j-consoltx').css({
    top:$(window).height()/2
});
if($.browser.msie && $.browser.version <9) $('.j-consoltx').addClass('z-show');
$(window).scroll(function (event) {
    if($.browser.msie && $.browser.version <9) return;
    var screenHeight = $(window).height();
    var bannerHeight = $('.j-swiper').height();
    if(bannerHeight < $('.j-consoltx').offset().top){
        $('.j-consoltx').addClass('z-show')
    }else{
        $('.j-consoltx').removeClass('z-show')
    }
});



});