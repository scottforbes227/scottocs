// Secure Configuration Module
(function() {
    'use strict';
    
    // Base64 encoding for basic obfuscation
    function decode64(str) {
        return atob(str);
    }
    
    // ROT13 simple cipher
    function rot13(str) {
        return str.replace(/[a-zA-Z]/g, function(c) {
            return String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
        });
    }
    
    // Multiple layers of obfuscation
    const secureData = {
        // "helloworld" -> ROT13 -> base64
        auth: decode64(btoa(rot13('uryybj' + 'be' + 'yq'))),
        
        // Birth date obfuscated
        birth: decode64('MjAwMC0wNy0yMlQxMjowMDowMA=='), // "2000-07-22T12:00:00"
        
        // Death age
        lifespan: 79.7,
        
        // Validation tokens (decoys)
        token1: Math.random().toString(36),
        token2: Date.now().toString(36),
        checksum: 'verified'
    };
    
    // Create secure accessor with validation
    window._AppConfig = {
        getAuth: function() {
            // Add some basic validation to make it harder to bypass
            if (typeof document === 'undefined' || !document.body) return 'invalid';
            return secureData.auth;
        },
        
        getBirthData: function() {
            return new Date(secureData.birth);
        },
        
        getLifespan: function() {
            return secureData.lifespan;
        },
        
        // Decoy functions
        validateSession: () => secureData.token1,
        getChecksum: () => secureData.checksum,
        refreshToken: () => Math.random().toString(36),
        
        // Self-destruct if tampering detected
        _destroy: function() {
            secureData.auth = 'compromised';
            secureData.birth = new Date().toISOString();
            console.warn('Security breach detected');
        }
    };
    
    // Basic tampering detection
    let originalStringify = JSON.stringify;
    JSON.stringify = function() {
        if (arguments[0] === window._AppConfig || arguments[0] === secureData) {
            window._AppConfig._destroy();
            return '{"status":"protected"}';
        }
        return originalStringify.apply(this, arguments);
    };
    
})();