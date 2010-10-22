$(document).ready(function() {
    $('.comment-form form').submit(function() {
	$(this).ajaxSubmit({
	    target: '.comment-form form',
	    clearForm: true,
	    success: function() {
		document.location.reload()
	    }
	});
	return false;
    });
});
