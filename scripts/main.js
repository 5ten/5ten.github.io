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
    $('a').smoothScroll();
});