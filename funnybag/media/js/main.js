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
      
      $('.code.block select[name$="language"]').each(function() {
        if( $("#"+$(this).attr("id")+"_iddtext").length < 1) {
          $(this).improveDropDown();
          $('.idd_textbox').focus(function() {
            $(this).val("");
          });
        }
      });
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
        .load('/ajax/new/', function(response) {
          $(this).fadeIn();
          $('#logo-view').text($('#view-name').text()+"@");
          try {
            var response = jQuery.parseJSON(response);
            if (!response.success) {
              document.location.hash = "#login/new";
              return false;
            }
          } catch(error) {}
          
          $('#new-record-form').ajaxForm({
            iframe: true,
            success: function(response, statusText, xhr, $form)  { 
              var response = jQuery.parseJSON(response);
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

  var LoginView = Backbone.View.extend({
    el: $(".main-view"),
    next: "#",
    
    initialize: function(next) {
      if (next) {
        this.next = "#"+next;
      }
    },

    render: function() {
      var next = this.next;
      $('.main-view').hide().load('/ajax/login/', function() { 
        $(this).fadeIn();

        $('#logo-view').text($('#view-name').text()+"@");
        $('#id_username').focus();
        
        $("#login-form").ajaxForm({
          success: function(response, statusText, xhr, $form)  { 
            response = jQuery.parseJSON(response);
            $("#login-form").find(".errors").remove();
            $("#login-form").find("input[type!=submit]").css("background", "white"); 
            if (response.success) {
              document.location.hash = next;
              $( "#username").text(response.data.username);
              $( "#userprofileinfo").show({ direction: "down"}, 700700);
            } else {
              $.each(response.data, function(name, message) {
                if(name == "__all__") {
                  $("#login-form fieldset").prepend("<span class='errors'>"+message+"</span>");
                } else {
                  $("#id_"+name).css("background", "#ffddaa");
                  $("label[for=id_"+name+"]").append(" <span class='errors'>"+message+"</span>");
                }
              });
            }
          },
        }); 
      });
    }
  });

  var RegistrationView = Backbone.View.extend({
    el: $(".main-view"),
    
    render: function() {
      $(".main-view").hide().load('/ajax/registration/', function() {
        $(this).fadeIn();
        
        $('#logo-view').text($('#view-name').text()+"@");
        
        $("#registration-form").ajaxForm({
          success: function(response, statusText, xhr, $form)  { 
            response = jQuery.parseJSON(response);
            $("#registration-form").find(".errors").remove();
            $("#registration-form").find("input[type!=submit]").css("background", "white"); 
            if (response.success) {
              document.location.hash = "#login";
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
    }
    
  });
    
  Workspace = Backbone.Controller.extend({

    routes: {
      "": "list",
      "t/:tag" : "tag",
      "a/:author" : "author",
      "new/:type" : "new",
      "new" : "new",
      "login" : "login",
      "login/:next" : "login",
      "logout" : "logout",
      "registration" : "registration",
      ":title/:hash/" : "details",
      ":hash/" : "details"
    },

    list: function() {
      $('.main-view').hide()
        .load('/ajax/list/', function() { 
          $(this).fadeIn(); 
          $('#logo-view').text($('#view-name').text()+"@");
        });
    },
    
    tag: function(tag) {
      $('.main-view').hide()
        .load('/ajax/list/tag/'+tag, function() { 
          $(this).fadeIn(); 
          $('#logo-view').text($('#view-name').text()+"@");
        });
    },

    author: function(author) {
      $('.main-view').hide()
        .load('/ajax/list/author/'+author, function() { 
          $(this).fadeIn(); 
          $('#logo-view').text($('#view-name').text()+"@");
        });
    },

    new: function() {
      new NewView().render();
    },

    login: function(next) {
      new LoginView(next).render();
    },

    logout: function() {
      $.get('ajax/logout/', function(response) {
        document.location.hash = "#";
        $("#userprofileinfo").hide(700);
        $("#username").text("");
      });
    },
    
    registration: function() {
      new RegistrationView().render();
    },
    
    details: function(first, second){
      hash = second ? second : first;
      new DetailsView().render(hash);
    },
    
  });
  
  new Workspace();
  Backbone.history.start();
});
