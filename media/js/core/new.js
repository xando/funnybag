$(document).ready( function() {
  $("li a").click(function() {
    $("li a").removeClass("active");
    $(this).addClass("active");

    new_active_form = "#"+$(this).attr("id").split("-")[0]+"-form";
    $(".form").fadeOut( "50", function() {
      $(new_active_form).fadeIn( "50", function() {
      });
    });
  });
});
                   
    
