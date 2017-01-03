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

    $('.inner').on('mouseover', 
        function(){
            alert('hey');
            $('.overlay').fadeIn(1000);
        },
        function(){
            $('.overlay').fadeIOut(1000);
        }
    );
    

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
    
    // $('a').smoothScroll();


    // var slide1 = new Waypoint({
    //   element: $('#anchor01'),
    //   handler: function(direction) {
    //     //$('.arrow.up').hide();        
    //     $('.arrow.down').show();
    //     $('.arrow.down').attr('href','#anchor02-01');
    //   }
    // });

    // var slide2 = new Waypoint({
    //   element: $('#anchor02-01'),
    //   handler: function(direction) {
    //     $('.arrow.down').show();
    //     $('.arrow.up').show();
    //     $('.arrow.up').attr('href','#anchor01');
    //     $('.arrow.down').attr('href','#anchor03-01');
    //   }
    // });

    // var slide3 = new Waypoint({
    //   element: $('#anchor03-01'),
    //   handler: function(direction) {
    //     $('.arrow.down').show();
    //     $('.arrow.up').show();
    //     $('.arrow.up').attr('href','#anchor02-01');
    //     $('.arrow.down').attr('href','#anchor04-01');
    //   }
    // });

    // var slide4 = new Waypoint({
    //   element: $('#anchor04-01'),
    //   handler: function(direction) {
    //     $('.arrow.up').show();
    //     $('.arrow.up').attr('href','#anchor03-01');
    //     //$('.arrow.down').hide();        
    //   }
    // });


});