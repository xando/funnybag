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
      

      var geocoder;
      var map;
      var infowindow = new google.maps.InfoWindow();
      var marker;
      function initialize() {
        geocoder = new google.maps.Geocoder();
        var latlng = new google.maps.LatLng(40.730885,-73.997383);
        var myOptions = {
          zoom: 8,
          center: latlng,
          mapTypeId: 'roadmap'
        }
        map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
      }
 
      function codeLatLng() {
        var input = document.getElementById("latlng").value;
        var latlngStr = input.split(",",2);
        var lat = parseFloat(latlngStr[0]);
        var lng = parseFloat(latlngStr[1]);
        var latlng = new google.maps.LatLng(lat, lng);
        geocoder.geocode({'latLng': latlng}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            if (results[1]) {
              map.setZoom(11);
              marker = new google.maps.Marker({
                position: latlng, 
                map: map
              }); 
              infowindow.setContent(results[1].formatted_address);
              infowindow.open(map, marker);
            } else {
          alert("No results found");
            }
          } else {
            alert("Geocoder failed due to: " + status);
          }
        });
      }
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
              if (response.success) {
                document.location.hash = "#";
                
              }
            },
          }); 
          
          $(this).fadeIn();
        })
        
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
      $('.main-view')
        .hide()
        .load('/ajax/list/', function() { 
          $(this).fadeIn(); 
        });
    },

    new: function(type) {
      new NewView().render();
    }        
    
  });
  
  new Workspace();
  Backbone.history.start();
});
