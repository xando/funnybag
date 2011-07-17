$(function(){

  var Notyfication = Backbone.View.extend({
    el: $("#notyfication"),
    
    initialize: function() {
    },
    
    show: function(text, time) {
      var $self = $(this.el);
      $self
        .text(text)
        .position({
          of: $("#header"),
          my: "center top",
          at: "center bottom",
          offset: "0px 12px",
        }).show();
      setTimeout(function() {
        $self.hide("slide", { direction: "up" }, 500);
      }, 6000);
    },
  });
  notyfication = new Notyfication();

  $(".back-button").live("click", function(){
    window.history.go(-1);
    return false;
  })

  $(".block-form input, .block-form textarea")
    .live("focus", function() {
      $(this).parents(".block-form").addClass("focus");
    })
    .live("blur", function() {
      $(this).parents(".block-form").removeClass("focus");
    });

  _.templateSettings = {
    interpolate : /\_\_(.+?)\_\_/g
  };
    
  var NewView = Backbone.View.extend({
    el: $(".main-view"),

    events: {
      "click .add-link": "add_block",
      "click .block-form .remove": "remove_block"
    },
    

    add_block: function(e) {
      var type = $(e.target).attr('name');
      var template = _.template($('#'+ type + '-template').html());
      $('.block-panel').append( template({'prefix' : $('.block-form.'+ type).length }) );
      $('label[for$=DELETE],input[id$=DELETE]').hide();
      $('#id_'+ type +'-TOTAL_FORMS').val( $('.block-form.'+ type).length );
      $('input[name$=sequence]').each( function(i) {
        $(this).val(i);
      });

      $('.block-form textarea').elastic();
      
      $('.block-form.code select[name$="language"]').each(function() {
        if( $("#"+$(this).attr("id")+"_iddtext").length < 1) {
          $(this).improveDropDown();
          $('.idd_textbox').focus(function() {
            $(this).val("");
          });
        }
      });

      $('.block-panel').sortable({
        placeholder: "block-form-placeholder",
        start: function(event, ui) {
          ui.placeholder.height( ui.item.height() );
          ui.item.toggleClass("block-form-onmove");
        },
        stop: function(event, ui) {
          ui.item.toggleClass("block-form-onmove");
          $('input[name$=sequence]').each( function(i) {
            $(this).val(i);
          });
        }
      });
    },
    
    remove_block: function(e) {
      var type = $(e.target).parent().attr('name');
      $('#id_'+ type +'-TOTAL_FORMS').val( $('.block-form.'+ type).length - 1 );
      $(e.target).parent('.block-form').find('input[name$=DELETE]').attr("checked", true);
      $(e.target).parent('.block-form').hide(300).remove();
      $('input[name$=sequence]').each( function(i) {
        $(this).val(i);
      });
      
      $('.block-form.'+type).each( function(i) {
        $(this).find('[id^=id_]').map( function() {
          $(this).attr("name", $(this).attr("name").replace(/\d+/, i));
          $(this).attr("id", $(this).attr("id").replace(/\d+/, i));
        });
      });
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
            beforeSubmit: function() {
              block = true;
              setTimeout(function() { 
                if (block) {
                  $.blockUI({ css: { 
                    border: 'none', 
                    padding: '15px', 
                    backgroundColor: '#000', 
                    '-webkit-border-radius': '10px', 
                    '-moz-border-radius': '10px', 
                    opacity: .5, 
                    color: '#fff' 
                  } });
                }
              }, 500); 
            },
            success: function(response, statusText, xhr, $form)  { 
              block = false;
              $.unblockUI();
              var response = jQuery.parseJSON(response);
              $("#new-record-form")
                .find(".errors").remove().end()
                .find("input[type!=submit],textarea").css("background", "white").end()

              
              if(response.success) {
                document.location.hash = "#";
              } else {
                $.each(response.data, function(name, message) {
                  if( /__all__$/.test(name)) {
                    $("#"+name.replace("-__all__", ""))
                      .css("border", "3px solid #FF9933")
                      .prepend("<div style='text-align: center' class='errors'>"+message+"</span>");
                  } else {
                    $("#id_"+name).css("background", "#ffddaa");
                    $("label[for=id_"+name+"]").append(" <span class='errors'>"+message+"</span>");
                  }
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

          $("#record-responses").load('/ajax/responses/'+ hash +'/');

          $("#response-form").ajaxForm({
            success: function(response, statusText, xhr, $form)  { 
              console.log(response);
              response = jQuery.parseJSON(response);
              if (response.success) {
                $("#record-responses").load('/ajax/responses/'+ hash +'/');
              }
            }
          });
        });
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
              if ( next == "#") {
                document.location.hash = "#a/" + response.data.username;
              } else {
                document.location.hash = next;
              }
              $( "#username").text(response.data.username);
              $( ".userprofile").show("slide", { direction: "up" }, 700);
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
              notyfication.show("You account was just created. Please login.");
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
      "login/*next" : "login",
      "logout" : "logout",
      "registration" : "registration",
      ":title/:hash/" : "details",
      ":hash/" : "details",
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
        $(".userprofile").hide("slide", { direction: "up" }, 700);
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
