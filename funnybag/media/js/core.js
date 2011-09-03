
$(function() {
  
  Record = Backbone.Model.extend({
    url : function(){
      if( this.get('id') ) {
        return '/api/record/' + this.get('id') + '/';
      }
      return '/api/record/';
    }
  });


  RecordList = Backbone.Collection.extend({
    model: Record, 
    url : function(){
      return '/api/record/'
    }
  });


  RecordListView = Backbone.View.extend({

    tagName:  "div",
    id: "record-list",
    className: "grid_12, view",
    
    template: _.template($('#record-list-template').html()),
    model: new RecordList(),

    initialize: function() {
      
      self = this;
      this.model.fetch({
        success: function() {
          self.render();
        }
      });
    },
    
    render: function() {
      $("#main-view").html(
        $(this.el).html(this.template({record_list :this.model.toJSON()}))
      );
    },
    
  });
  

  RecordDetailsView = Backbone.View.extend({

    tagName:  "div",
    id: "record-details",
    className: "grid_12",
    
    template: _.template($('#record-details-template').html()),

    initialize: function(options) {
      self = this;
      model = new Record({id:options.hash})
      model.fetch({
        success: function() {
          self.render();
        }
      });
    },
    
    render: function() {
      $("#main-view").html(
        $(this.el).html(this.template(model.toJSON()))
      );
    },
    
  });


  RecordNewView = Backbone.View.extend({

    tagName:  "div",
    id: "record-new",
    className: "grid_12, view",
    
    template: _.template($('#record-new-template').html()),

    events: {
      "submit form": "submit",
      "click .add-block-button": "add_block"
    },

    initialize: function(options) {
      this.render();
    },

    submit: function(e) {
      var self = this;
      e.preventDefault();
      $('#record-new-form').ajaxForm({
        beforeSubmit: function(arr, $form, options) {
          arr = _.filter(arr, function(element) {
            return element.name == 'image' || element.name == 'csrfmiddlewaretoken';
          });
        },
        success: function(response, statusText, xhr, jQ) {
          var local_files = jQuery.parseJSON(response);
          $(self.el).find("input[name=local_file]").each( 
            function(i) {
              $(this).val(local_files[i]);
            }
          );
          self.save();
        }
      });
    },

    save: function() {
      var blocks = [];
      $('.block-form').each(function(){ 
        var block = {};
        var data = {};
        $(this).find('input,textarea').not('.fake').each( function() { 
          data[$(this).attr("name")] = $(this).val();
        });
          
        block["type"] = $(this).attr("name");
        block["data"] = data;
        blocks.push(block);
      });

      var new_model = new Record({
        title: $(this.el).find("input[name=title]").val(),
        tags: $(this.el).find("input[name=tags]").val(),
        blocks: blocks
      });
      
      var self = this;
      new_model.save(null, {
        success: function(model, response, xhr){ 
          self.hide_errors();
          if (model.isNew()) {
            self.show_errors(response);
          } else {
            window.location = "#" + model.get("id") + "/" + model.get("slug") + "/";
          }
        } 
      });
    },

    show_errors: function(response) {
      _.each(response[0], function(errors, field) {
        $("input[name="+ field  +"]").css("border", "3px solid #FF9933");
        $("label[for=id_"+ field +"]").append("<span class='errors'>: " + errors + "</span>");
      });
    },

    hide_errors: function() {
      $("input").css("border", "3px solid rgba(122, 192, 0, 0.15)");
      $("label .errors").remove();
    },
    
    add_block: function(e) {
      var block_name = $(e.target).attr("name");
      var block_template = _.template($("#" + block_name + "-block-new-template").html());
      $('.add-block').before(block_template());
    },
    
    render: function() {
      $("#main-view").html( 
        $(this.el).html(this.template()) 
      );
    },
    
  });

  
  UserAuthorization = Backbone.Model.extend({
    url: function() {
      return '/api/user/authorization/'
    },

    is_authorized: function() {
      return this.get('id') ? true : false
    }
  });

  userAuthorization = new UserAuthorization();
  
  
  UserAuthorizationView = Backbone.View.extend({
    tagName:  "div",
    id: "user-authorization",
    className: "grid_12, view",

    template: _.template($('#user-authorization-template').html()),

    events: {
      "submit form": "submit",
    },

    submit: function(e) {
      e.preventDefault();
      
      userAuthorization.save({
        username: this.$('[name=username]').val(),
        password: this.$('[name=password]').val() 
      }, {
        success: this.success
      });
      
    },

    initialize: function(options) {
      this.render();
    },

    render: function() {
      $("#main-view").html( 
        $(this.el).html(this.template()) 
      );
    },
    
    success: function(model, response) {
      if( userAuthorization.is_authorized() ) {
        window.location.hash = "";
      }
    }
  });


  Router =  Backbone.Router.extend({

    routes: {
      "":                     "list",
      ":hash/:slug/":         "details",
      "new/":                 "create",
      "login/":               "login",
    },
    
    list: function() {
      new RecordListView();
    },

    details: function(hash, slug) {
      new RecordDetailsView({hash: hash});
    },

    create: function() {
      new RecordNewView();
    },

    login: function() {
      new UserAuthorizationView();
    }
    
  });
  new Router();
  
  Backbone.history.start();
  
})
