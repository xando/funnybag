$(function() {
  
  Record = Backbone.Model.extend({
    url : function(){
      return '/api/record/' + this.get('id') + '/';
    }
  });

  RecordList = Backbone.Collection.extend({
    model: Record, 
    url : function(){
      return '/api/record/'
    }
  });
  recordList = new RecordList();


  RecordListView = Backbone.View.extend({

    tagName:  "div",
    id: "record-list",
    
    template: _.template($('#record-list-template').html()),
    model: recordList,

    initialize: function() {
      
      self = this;
      this.model.fetch({
        success: function() {
          self.render();
        }
      });
    },
    
    render: function() {
      $("#main-view").html($(this.el).html( this.template({record_list : this.model.toJSON() }) ));
    },
    
  });
  
  recordListView = new RecordListView();
  // template: _.template($('#item-template').html()),  
})
