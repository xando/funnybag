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
      
      $('#id_'+ type +'-TOTAL_FORMS').val( $('.block.'+ type).length );
      $('input[name$=sequence]').each( function(i) {
        $(this).val(i)
      });

      $('.block textarea').elastic();
    },
    
    remove_block: function(e) {
      $(e.target).parent('.block').addClass("disabled");
    },
    
    render: function() {
      $(this.el)
        .hide()
        .load('/ajax/new/', function() {
        
          $('#new-record-form').ajaxForm({
            iframe: true,
            success: function(response, statusText, xhr, $form)  { 
              response = jQuery.parseJSON(response);
              if(response.success) {
                document.location.hash = "#";
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
      "new/:type" : "new",
      "new" : "new",
      "login" : "login",
      ":title/:hash/" : "details",
      ":hash/" : "details",
    },

    list: function(id) {
      $('.main-view')
        .hide()
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

        });
    },

    details: function(first, second){
      hash = second ? second : first;
      new DetailsView().render(hash);
      
    }
    
  });
  
  new Workspace();
  Backbone.history.start();
});
