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

	events: {
	    "click .time-stamp": "switch_timestamp_format"
	},

	switch_timestamp_format: function(e) {
	    $(e.target).parent().find('.time-stamp').toggleClass('hidden');
	},

	initialize: function() {
	    $('body').css("overflow-y", "auto");
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



    RecordResponsesView = Backbone.View.extend({

	tagName: "div",
	id: "record-responses",

	template: _.template($('#record-responses-template').html()),

	render: function() {
	    $(this.el).html(this.template());
	    return this;
	}

    });


    RecordDetailsView = Backbone.View.extend({

	tagName:  "div",
	id: "record-details",
	className: "grid_12 view",

	template: _.template($('#record-details-template').html()),

	events: {
	    "click .time-stamp": "switch_timestamp_format"
	},

	switch_timestamp_format: function(e) {
	    $(this.el).find('.time-stamp').toggleClass('hidden');
	},

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

	    var responses_view = new RecordResponsesView();
	    $(this.el).after(responses_view.render().el);
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
	    "submit form.login"                      : "submit",
	    "keyup form.login input[name=username]"  : "update",
	    "keyup form.login input[name=password]"  : "update",
	    "click .scroll_to_registration"          : "scroll_to_registration"
	},

	scroll_to_registration: function(e) {
	    $.scrollTo('.register', 600, {offset:-100});
	},

	submit: function(e) {
	    e.preventDefault();

	    userAuthorization.save({
		username: this.$('[name=username]').val(),
		password: this.$('[name=password]').val()
	    }, {
		success: this.login_success,
		error: this.login_error
	    });
	},

	update: function() {
	    if(this.$('[name=username]').val() && this.$('[name=password]').val()) {
		this.$('form.login input[type=submit]').removeClass("disabled");
	    } else {
		this.$('form.login input[type=submit]').addClass("disabled");
	    }
	},

	initialize: function(sub_view) {
	    this.render();
	    $('body').css("overflow-y", "hidden");
	    if (sub_view == "register" ) {
		$.scrollTo('.register', 0, {offset:-100});
	    }
	    if (sub_view == "login" ) {
		$.scrollTo(0, 0);
	    }
	},

	render: function() {
	    $("#main-view").html(
		$(this.el).html(this.template())
	    );
	},

	login_success: function(model, data, response) {
	    if(response.status != 200) {
		alert("user and password didn't match")
	    }
	    if( userAuthorization.is_authorized() ) {
		window.location.hash = "";
	    }
	},

	login_error: function() {
	    alert("login_error");
	}
    });

    Router =  Backbone.Router.extend({

	routes: {
	    "":                     "list",
	    ":hash/:slug/":         "details",
	    "new/":                 "create",
	    "register/":            "register",
	    "login/":               "login",
	    "logout/":              "logout",
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

	logout: function() {
	    userAuthorization.destroy();
	},

	login: function() {
	    new UserAuthorizationView("login");
	},

	register: function() {
	    new UserAuthorizationView("register");
	}

    });
    new Router();

    Backbone.history.start();

})
