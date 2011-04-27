$(function(){
  
  _.templateSettings = {
    interpolate : /\_\_(.+?)\_\_/g
  };
    
  var NewView = Backbone.View.extend({
    el: $(".main-view"),

    events: {
      "click .add-link": "add_block",
      "click .block .remove": "remove_block"
    },
    
    add_block: function(e) {
      type = $(e.target).attr('name');
      var template = _.template($('#'+ type + '-template').html());
      $('.block-panel').append( template({'prefix' : $('.block.'+ type).length }) );
      $('label[for$=DELETE],input[id$=DELETE]').hide();
      $('#id_'+ type +'-TOTAL_FORMS').val( $('.block.'+ type).length );
      $('input[name$=sequence]').each( function(i) {
        $(this).val(i);
      });

      $('.block textarea').elastic();
    },
    
    remove_block: function(e) {
      if ($(e.target).parent('.block').find('input[name$=DELETE]').is(":checked") ) {
        $(e.target).parent('.block').removeClass("disabled");
        $(e.target).parent('.block').find('textarea,input').removeAttr("disabled");
        $(e.target).parent('.block').find('input[name$=DELETE]').attr("checked", false);
        $('#id_'+ type +'-TOTAL_FORMS').val( $('.block.'+ type).length );
      } else {
        $('#id_'+ type +'-TOTAL_FORMS').val( $('.block.'+ type).length - 1 );
        $(e.target).parent('.block').addClass("disabled");
        $(e.target).parent('.block').find('textarea,input').attr("disabled", true);
        $(e.target).parent('.block').find('input[name$=DELETE]').attr("checked", true);
      }
    },
    
    render: function() {
      $(this.el)
        .hide()
        .load('/ajax/new/', function() {
        
          $('#new-record-form').ajaxForm({
            iframe: true,
            success: function(response, statusText, xhr, $form)  { 
              response = jQuery.parseJSON(response);
              $("#new-record-form").find(".errors").remove();
              $("#new-record-form").find("input[type!=submit],textarea")
                .css("background", "white"); 
              if(response.success) {
                document.location.hash = "#";
              } else {
                $.each(response.data, function(name, message) {
                  $("#id_"+name).css("background", "#ffddaa");
                  $("label[for=id_"+name+"]").append(" <span class='errors'>"+message+"</span>");
                });
              }
            },
          }); 
          
          $(this).fadeIn();
        })
        
      return this;
    }
  });    

  var DetailsView = Backbone.View.extend({
    el: $(".main-view"),
    
    render: function(hash) {
      $(this.el)
        .hide()
        .load('/ajax/details/'+ hash +'/', function() {
          $(this).fadeIn();
        })
    }
  });

  Workspace = Backbone.Controller.extend({

    routes: {
      "": "list",
      "t/*tags" : "tags",
      "new/:type" : "new",
      "new" : "new",
      "login" : "login",
      "registration" : "registration",
      ":title/:hash/" : "details",
      ":hash/" : "details"
    },

    list: function(id) {
      $('.main-view').hide()
        .load('/ajax/list/', function() { 
          $(this).fadeIn(); 
        });
    },

    new: function(type) {
      new NewView().render();
    },

    login: function() {
      $('.main-view')
        .hide().load('/ajax/login/', function() { 
          $(this).fadeIn();
          
          $('div.login-registration > div').hide();
          $('div.login-registration > div.login').show();
          
          $('div.login-registration> h1').click(function() {
            var $nextDiv = $(this).next();
            var $visibleSiblings = $nextDiv.siblings('div:visible');
            
            if ($visibleSiblings.length ) {
              $visibleSiblings.slideUp('fast', function() {
                $nextDiv.slideToggle('fast');
              });
            } else {
              $nextDiv.slideToggle('fast');
            }
          });

          $("#login-form").ajaxForm({
            success: function(response, statusText, xhr, $form)  { 
              response = jQuery.parseJSON(response);
              $("#login-form").find(".errors").remove();
              $("#login-form").find("input[type!=submit]").css("background", "white"); 
              if (response.success) {
                document.location.hash = "#";
              } else {
                $.each(response.data, function(name, message) {
                  if(name == "__all__") {
                    $("#login-form fieldset").prepend(" <span class='errors'>"+message+"</span>");
                  } else {
                    $("#id_"+name).css("background", "#ffddaa");
                    $("label[for=id_"+name+"]").append(" <span class='errors'>"+message+"</span>");
                  }
                });
              }
              
            },
          }); 

          $("#registration-form").ajaxForm({
            success: function(response, statusText, xhr, $form)  { 
              response = jQuery.parseJSON(response);
              $("#registration-form").find(".errors").remove();
              $("#registration-form").find("input[type!=submit]").css("background", "white"); 
              if (response.success) {
                document.location.hash = "#";
              } else {
                $.each(response.data, function(name, message) {
                  if(name == "__all__") {
                    $("#login-form fieldset").prepend(" <span class='errors'>"+message+"</span>");
                  } else {
                    $("#id_"+name).css("background", "#ffddaa");
                    $("label[for=id_"+name+"]").append(" <span class='errors'>"+message+"</span>");
                  }
                });
              }
              
            },
          }); 

        });
    },
    
    registration: function() {
      $('.main-view').hide()
        .load('/ajax/registration/', function() { 
          $(this).fadeIn();
        });
    },
    
    details: function(first, second){
      hash = second ? second : first;
      new DetailsView().render(hash);
      
    },
    
    tags: function(tags) {
      $('.main-view').hide()
        .load('/ajax/list/'+tags, function() { 
          $(this).fadeIn(); 
        });
    }
    
  });
  
  new Workspace();
  Backbone.history.start();
});
