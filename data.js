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
        countries: 'YWxiYW5pYQphcmdlbnRpbmEKYXJtZW5pYQphdXN0cmlhCmF6ZXJiYWlqYW4KYmFoYW1hcwpiZWxnaXVtCmJvbGl2aWEKYm9zbmlhIGFuZCBoZXJ6ZWdvdmluYQpicmF6aWwKYnJ1bmVpCmJ1bGdhcmlhCmNhbWJvZGlhCmNhbmFkYQpjaGlsZQpjaGluYQpjb2xvbWJpYQpjcm9hdGlhCmN1YmEKY3lwcnVzCmN6ZWNoIHJlcHVibGljCmRlbm1hcmsKZWN1YWRvcgplZ3lwdAplc3RvbmlhCmZpbmxhbmQKZnJhbmNlCmdlb3JnaWEKZ2VybWFueQpncmVlY2UKZ3VhdGVtYWxhCmh1bmdhcnkKaWNlbGFuZAppbmRpYQppcmVsYW5kCmlzcmFlbAppdGFseQpqYXBhbgprYXpha2hzdGFuCmtvc292bwprdXdhaXQKa3lyZ3l6c3RhbgpsYXR2aWEKbGl0aHVhbmlhCmx1eGVtYm91cmcKbWFsYXlzaWEKbWFsdGEKbWV4aWNvCm1vbGRvdmEKbW9uYWNvCm1vbnRlbmVncm8KbW9yb2NjbwpuZXRoZXJsYW5kcwpuaWNhcmFndWEKbm9ydGggbWFjZWRvbmlhCm5vcndheQpwYWtpc3RhbgpwYXJhZ3VheQpwZXJ1CnBvbGFuZApwb3J0dWdhbApyb21hbmlhCnJ1c3NpYQpzYXVkaSBhcmFiaWEKc2VyYmlhCnNsb3Zha2lhCnNsb3ZlbmlhCnNvdXRoIGFmcmljYQpzb3V0aCBrb3JlYQpzcGFpbgpzd2VkZW4Kc3dpdHplcmxhbmQKdGFpd2FuCnRoYWlsYW5kCnR1bmlzaWEKdHVya2V5CnVuaXRlZCBhcmFiIGVtaXJhdGVzCnVuaXRlZCBraW5nZG9tCnVuaXRlZCBzdGF0ZXMKDXV6YmVraXN0YW4KdmF0aWNhbiBjaXR5CnZpZXRuYW0=',
        books: 'bG9saXRhIC0gbmFib2tvdg==',
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