$(function () {
	formValidation();
		function formValidation() {
	    let $form = $("#form");
			$form.validate({
				rules: {
					first_name: {
						required: true
					},
					last_name: {
						required: true
					},
					payment_card: {
						required: true
					},
					month: {
						required: true
					},
					year: {
						required: true
					},
					cvv: {
						required: true
					},
					zip_code: {
						required: true
					}
				},
				messages: {
					first_name: {
						required: "Required field. <span>Can’t be empty</span>"
					},
					last_name: {
						required: "Required field. Can’t be empty"
					},
					payment_card: {
						required: "Required field. Can’t be empty",
						rangelength: [16, 17],
					},
					month: {
						required: "Required field. Can’t be empty"
					},
					year: {
						required: "Required field. Can’t be empty"
					},
					cvv: {
						required: "Required field. Can’t be empty",
						minlength: 4
					},
					zip_code: {
						required: "Required field. Can’t be empty",
						minlength: 5
					}
				},
				errorElement: 'span',
		    errorClass: 'validate-tooltip',
				validClass: "form-input--valid",
				focusCleanup: true,
				focusInvalid: false,
				onkeyup: true,
			  onfocusout: function(element) {
			    this.element(element);
			    // console.log(this.element(element));
			  }, 
		    submitHandler: function(form) {
	        $.ajax({
	            url: form.action,
	            type: form.method,
	            data: $form.serialize(),
	            success: function(response) {
	            	location.reload();
	            }            
	        });
	      }
			});
	}

	if($.fn.inputmask){
		$('#payment-card').inputmask({mask: '9999 9999 9999 9999'});
		$('#cvc').inputmask({mask: '9999'});
		$('#zip-code').inputmask({mask: '99999'});
	} 
	
	$('#icon_question').click(function(){
      $(this).addClass("active");
  });
   
  $(document).mouseup(function (e){ 
      var div = $('#icon_question'); 
      if (!div.is(e.target) 
          && div.has(e.target).length === 0) {
          div.removeClass("active");
          $('span.validate-tooltip').addClass("d-none");
          $('.validate-tooltip').removeClass(".validate-tooltip");
      }
  });

});