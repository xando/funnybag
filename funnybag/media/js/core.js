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
      "submit form": "save"
    },

    initialize: function(options) {
      this.render();
      
    },

    save: function() {
      new_model = new Record({title: $(this.el).find("input[name=title]").val(),
                              tags: $(this.el).find("input[name=tags]").val()});
      new_model.save();
      return false;
    },
    
    render: function() {
      $("#main-view").html( 
        $(this.el).html(this.template()) 
      );
    },
    
  });
  

  var Router =  Backbone.Router.extend({

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
