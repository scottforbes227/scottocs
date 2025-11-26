// Secure data module - only accessible after authentication
(function() {
    'use strict';
    
    // This module will only expose data after proper authentication
    let isAuthenticated = false;
    let dataCache = null;
    let accessCount = 0;
    let lastAccess = 0;
    
    // Heavily obfuscated data that gets decoded only after authentication
    const encryptedData = {
        // Base64 encoded data
        countries: 'YWxiYW5pYQphcmdlbnRpbmEKYXJtZW5pYQphdXN0cmlhCmF6ZXJiYWlqYW4KYmFoYW1hcwpiZWxnaXVtCmJvbGl2aWEKYm9zbmlhIGFuZCBoZXJ6ZWdvdmluYQpicmF6aWwKYnJ1bmVpCmJ1bGdhcmlhCmNhbWJvZGlhCmNhbmFkYQpjaGlsZQpjaGluYQpjb2xvbWJpYQpjcm9hdGlhCmN1YmEKY3lwcnVzCmN6ZWNoIHJlcHVibGljCmRlbm1hcmsKZWd5cHQKZXN0b25pYQpmaW5sYW5kCmZyYW5jZQpnZW9yZ2lhCmdlcm1hbnkKZ3JlZWNlCmd1YXRlbWFsYQpodW5nYXJ5CmljZWxhbmQKaW5kaWEKaXJlbGFuZAppc3JhZWwKaXRhbHkKamFwYW4Ka2F6YWtoc3Rhbgprb3Nvdm8Ka3V3YWl0Cmt5cmd5enN0YW4KbGF0dmlhCmxpdGh1YW5pYQpsdXhlbWJvdXJnCm1hbGF5c2lhCm1hbHRhCm1leGljbwptb2xkb3ZhCm1vbmFjbwptb250ZW5lZ3JvCm1vcm9jY28KbmV0aGVybGFuZHMKbmljYXJhZ3VhCm5vcnRoIG1hY2Vkb25pYQpub3J3YXkKcGFraXN0YW4KcGFyYWd1YXkKcGVydQpwb2xhbmQKcG9ydHVnYWwKcm9tYW5pYQpydXNzaWEKc2F1ZGkgYXJhYmlhCnNlcmJpYQpzbG92YWtpYQpzbG92ZW5pYQpzb3V0aCBhZnJpY2EKc291dGgga29yZWEKc3BhaW4Kc3dlZGVuCnN3aXR6ZXJsYW5kCnRhaXdhbgp0aGFpbGFuZAp0dW5pc2lhCnR1cmtleQp1bml0ZWQgYXJhYiBlbWlyYXRlcwp1bml0ZWQga2luZ2RvbQp1bml0ZWQgc3RhdGVzCg11emJla2lzdGFuCnZhdGljYW4gY2l0eQp2aWV0bmFtCg==',
        books: 'aW5maW5pdGUgamVzdCAtIGRhdmlkIGZvc3RlciB3YWxsYWNlCnRoZSBteXRoIG9mIHNpc3lwaHVzIC0gYWxiZXJ0IGNhbXVzCg==',
        // Decoys
        decoy1: 'ZmFrZSBkYXRh',
        decoy2: 'bm90IHJlYWwgaW5mb3JtYXRpb24=',
        decoy3: 'dGVzdCBkYXRhIG9ubHk='
    };
    
    // Simple base64 decode
    function decode64(str) {
        try {
            return atob(str);
        } catch (e) {
            return '';
        }
    }
    
    // Authenticate and unlock data
    function authenticate(token) {
        const validTokens = ['authenticated_user_verified', 'session_validated'];
        if (validTokens.includes(token)) {
            isAuthenticated = true;
            lastAccess = Date.now();
            return true;
        }
        return false;
    }
    
    // Get data only if authenticated - with auto-clear after use
    function getSecureData() {
        accessCount++;
        
        // Security checks
        if (!isAuthenticated) {
            return { error: 'Authentication required' };
        }
        
        if (accessCount > 10) { // Limit access attempts
            isAuthenticated = false;
            dataCache = null;
            return { error: 'Too many access attempts' };
        }
        
        if (Date.now() - lastAccess > 30000) { // 30 second timeout
            isAuthenticated = false;
            dataCache = null;
            return { error: 'Session timeout' };
        }
        
        if (!dataCache) {
            // Decode data only when needed and authenticated
            dataCache = {
                countries: decode64(encryptedData.countries).split('\n').filter(Boolean),
                books: decode64(encryptedData.books).split('\n').filter(Boolean)
            };
            
            // Clear encoded data after decoding
            setTimeout(() => {
                encryptedData.countries = '';
                encryptedData.books = '';
            }, 1000);
        }
        
        // Return copy to prevent direct access to cached data
        return {
            countries: [...dataCache.countries],
            books: [...dataCache.books]
        };
    }
    
    // Auto-clear data after period of inactivity
    setInterval(() => {
        if (isAuthenticated && Date.now() - lastAccess > 60000) { // 1 minute
            isAuthenticated = false;
            dataCache = null;
            accessCount = 0;
        }
    }, 30000);
    
    // Expose limited interface
    window._SecureData = {
        authenticate: authenticate,
        getData: getSecureData,
        isAuthenticated: () => isAuthenticated,
        
        // Decoy functions to confuse inspection
        validateToken: () => Math.random().toString(36),
        refreshSession: () => Date.now().toString(36),
        getChecksum: () => 'protected',
        getDecoyData: () => ({ fake: 'data' }),
        validateAccess: () => 'verified'
    };
    
    // Hide the implementation
    Object.defineProperty(window._SecureData, 'constructor', {
        value: Object,
        writable: false,
        configurable: false
    });
    
})();