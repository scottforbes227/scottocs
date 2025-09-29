// Security measures to prevent inspection
(function() {
    'use strict';
    
    // Disable right-click context menu
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Disable common developer shortcuts
    document.addEventListener('keydown', function(e) {
        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
            (e.ctrlKey && e.key === 'u')) {
            e.preventDefault();
            showSecurityWarning();
            return false;
        }
    });
    
    // Detect when dev tools are opened
    let devtools = {
        open: false,
        orientation: null
    };
    
    setInterval(function() {
        if (window.outerHeight - window.innerHeight > 160 || 
            window.outerWidth - window.innerWidth > 160) {
            if (!devtools.open) {
                devtools.open = true;
                handleDevToolsOpen();
            }
        } else {
            devtools.open = false;
        }
    }, 500);
    
    function handleDevToolsOpen() {
        // Clear sensitive data from memory when dev tools detected
        if (window._AppConfig) {
            // Replace with dummy data
            window._AppConfig.getAuth = () => 'access_denied';
            window._AppConfig.getBirthData = () => new Date();
            window._AppConfig.getLocationData = () => ['access_denied'];
        }
        
        showSecurityWarning();
    }
    
    function showSecurityWarning() {
        // Create a subtle warning without being too intrusive
        const existingWarning = document.getElementById('security-notice');
        if (existingWarning) return;
        
        const warning = document.createElement('div');
        warning.id = 'security-notice';
        warning.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(255, 107, 107, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 9999;
            font-family: monospace;
        `;
        warning.textContent = 'Developer tools detected';
        document.body.appendChild(warning);
        
        setTimeout(() => {
            if (warning.parentNode) {
                warning.parentNode.removeChild(warning);
            }
        }, 3000);
    }
    
    // Obfuscate the console
    if (typeof console !== 'undefined') {
        const originalLog = console.log;
        console.log = function(...args) {
            // Only show logs in development mode
            if (window.location.hostname === 'localhost') {
                originalLog.apply(console, args);
            }
        };
    }
    
    // Clear global variables that might expose sensitive data
    window.addEventListener('load', function() {
        setTimeout(() => {
            // Remove any accidentally exposed globals
            delete window.PASSWORD;
            delete window.BIRTH_DATE;
            delete window.COUNTRIES_DATA;
            delete window.BOOKS_DATA;
        }, 1000);
    });
    
})();