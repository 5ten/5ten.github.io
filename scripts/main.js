jQuery(function($){

    var hr = (new Date()).getHours();

    if ((hr <= 7) || (hr >= 17)) {
        $('body').addClass('night');
    }
    var contactModal = $('#contactModal');
    var contactButton = $('#contactButton');
    var closeModal = $('#closeForm');
    contactButton.on('click', function() {
        contactModal.toggleClass('display');
    });
    closeModal.on('click', function() {
        contactModal.removeClass('display');
    });

    var $contactForm = $('#contact-form');
    $contactForm.submit(function(e) {
        e.preventDefault();
        $.ajax({
            url: '//formspree.io/peter@510interactive.com',
            method: 'POST',
            data: $(this).serialize(),
            dataType: 'json',
            beforeSend: function() {
                $contactForm.append('<div class="alert alert--loading">Sending message…</div>');
            },
            success: function(data) {
                $contactForm.find('.alert--loading').hide();
                $contactForm.append('<div class="alert alert--success">Message sent!</div>');
            },
            error: function(err) {
                $contactForm.find('.alert--loading').hide();
                $contactForm.append('<div class="alert alert--error">Ops, there was an error.</div>');
            }
        });
    });


});