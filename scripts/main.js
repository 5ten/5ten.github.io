jQuery(function($){
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