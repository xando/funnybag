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
      $(this.el).load('/ajax/new/', function() {
        
        $('#new-record-form').ajaxForm({
          success: function(response, statusText, xhr, $form) {
            if(response.success) {
              document.location.hash = "#";
            } 
          },
        }); 
        
      }).hide().fadeIn('slow');
      return this;
    }
  
  });

  var Workspace = Backbone.Controller.extend({

    routes: {
      "": "list",
      "new/:type" : "new",
      "new" : "new",
    },

    initialize: function() {
    },

    list: function(id) {
      $('.main-view').load('/ajax/list/').hide().fadeIn('slow');
    },

    new: function(type) {
      new NewView().render();
    }        
    
  });
  
  new Workspace();
  Backbone.history.start();
});
