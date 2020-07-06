$(document).ready(function(){
    var $item = $(".btn--info").on('click', function(){
        var idx = $item.index(this)
        $("div.solution").eq(idx).slideToggle();
    });
});
