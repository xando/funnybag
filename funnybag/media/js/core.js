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
    className: "grid_12",
    
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
    className: "grid_12",
    
    template: _.template($('#record-new-template').html()),

    events: {
      "submit form": "save",
      "click .add-block-button": "add_block"
    },

    initialize: function(options) {
      this.render();
    },

    save: function() {
      var new_model = new Record({
        title: $(this.el).find("input[name=title]").val(),
        tags: $(this.el).find("input[name=tags]").val(),
        blocks: [{
          "type": "text",
          "data": {"text": ""}
        }]
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
      return false;
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
  

  Router =  Backbone.Router.extend({

    routes: {
      "":                     "list",
      ":hash/:slug/":         "details",
      "new/":                 "create",
    },
    
    list: function() {
      new RecordListView();
    },

    details: function(hash, slug) {
      new RecordDetailsView({hash: hash});
    },

    create: function() {
      new RecordNewView();
    }
    
  });
  new Router();
  
  Backbone.history.start();
  
})