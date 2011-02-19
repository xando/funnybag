$(function(){
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
      if (type==null) 
        $('.main-view').load('/ajax/new/').hide().fadeIn('slow');
      else 
        $('.main-view').load('/ajax/new/'+ type +'/', function() {
          $(this).find('.new-form').ajaxForm({
              success: function(response) {
                if (response.success) {
                    document.location.hash = "";
                }
            }
          });
        }).hide().fadeIn('slow');
    },

    
  });
  
  new Workspace();
  Backbone.history.start();
});
