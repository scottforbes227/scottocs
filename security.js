// Security measures
(function() {
    'use strict';

    // Clear global variables that might expose sensitive data
    window.addEventListener('load', function() {
        setTimeout(() => {
            delete window.PASSWORD;
            delete window.BIRTH_DATE;
            delete window.COUNTRIES_DATA;
            delete window.BOOKS_DATA;
        }, 1000);
    });

})();