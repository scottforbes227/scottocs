// Secure data module - only accessible after authentication
(function() {
    'use strict';
    
    // This module will only expose data after proper authentication
    let isAuthenticated = false;
    let dataCache = null;
    let accessCount = 0;
    let lastAccess = 0;

    const LS_KEY = 'scott_user_data';
    
    // Heavily obfuscated data that gets decoded only after authentication
    const encryptedData = {
        // Base64 encoded data
        countries: 'YWxiYW5pYQphcmdlbnRpbmEKYXJtZW5pYQphdXN0cmlhCmF6ZXJiYWlqYW4KYmFoYW1hcwpiZWxnaXVtCmJvbGl2aWEKYm9zbmlhIGFuZCBoZXJ6ZWdvdmluYQpicmF6aWwKYnJ1bmVpCmJ1bGdhcmlhCmNhbWJvZGlhCmNhbmFkYQpjaGlsZQpjaGluYQpjb2xvbWJpYQpjcm9hdGlhCmN1YmEKY3lwcnVzCmN6ZWNoIHJlcHVibGljCmRlbm1hcmsKZWN1YWRvcgplZ3lwdAplc3RvbmlhCmZpbmxhbmQKZnJhbmNlCmdlb3JnaWEKZ2VybWFueQpncmVlY2UKZ3VhdGVtYWxhCmh1bmdhcnkKaWNlbGFuZAppbmRpYQppcmVsYW5kCmlzcmFlbAppdGFseQpqYXBhbgprYXpha2hzdGFuCmtvc292bwprdXdhaXQKa3lyZ3l6c3RhbgpsYXR2aWEKbGl0aHVhbmlhCmx1eGVtYm91cmcKbWFsYXlzaWEKbWFsdGEKbWV4aWNvCm1vbGRvdmEKbW9uYWNvCm1vbnRlbmVncm8KbW9yb2NjbwpuZXRoZXJsYW5kcwpuaWNhcmFndWEKbm9ydGggbWFjZWRvbmlhCm5vcndheQpwYWtpc3RhbgpwYXJhZ3VheQpwZXJ1CnBvbGFuZApwb3J0dWdhbApyb21hbmlhCnJ1c3NpYQpzYXVkaSBhcmFiaWEKc2VyYmlhCnNsb3Zha2lhCnNsb3ZlbmlhCnNvdXRoIGFmcmljYQpzb3V0aCBrb3JlYQpzcGFpbgpzd2VkZW4Kc3dpdHplcmxhbmQKdGFpd2FuCnRoYWlsYW5kCnR1bmlzaWEKdHVya2V5CnVuaXRlZCBhcmFiIGVtaXJhdGVzCnVuaXRlZCBraW5nZG9tCnVuaXRlZCBzdGF0ZXMKDXV6YmVraXN0YW4KdmF0aWNhbiBjaXR5CnZpZXRuYW0=',
        books: 'aW5maW5pdGUgamVzdCAtIGRhdmlkIGZvc3RlciB3YWxsYWNlCnRoZSBteXRoIG9mIHNpc3lwaHVzIC0gYWxiZXJ0IGNhbXVz',
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

    // Load user-saved data from localStorage
    function loadFromStorage() {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) { /* ignore */ }
        return null;
    }

    // Save user data to localStorage
    function saveToStorage(data) {
        try {
            data.lastUpdated = new Date().toISOString();
            localStorage.setItem(LS_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            return false;
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

    // Update user data (admin panel save)
    function updateUserData(newData) {
        if (!isAuthenticated) return { error: 'Authentication required' };
        lastAccess = Date.now();

        const getOrDefault = (field) =>
            newData[field] !== undefined ? newData[field] : ((dataCache && dataCache[field]) || []);

        // Merge new values with existing cache
        const updated = {
            countries: getOrDefault('countries'),
            currentBooks: getOrDefault('currentBooks'),
            booksRead: getOrDefault('booksRead'),
        };

        // Update cache
        dataCache = updated;
        return saveToStorage(updated) ? { success: true } : { error: 'Storage unavailable' };
    }
    
    // Get data only if authenticated
    function getSecureData() {
        accessCount++;
        
        // Security checks
        if (!isAuthenticated) {
            return { error: 'Authentication required' };
        }

        lastAccess = Date.now();
        
        if (!dataCache) {
            // Check localStorage first (user-edited data takes priority)
            const stored = loadFromStorage();
            if (stored && stored.countries && stored.countries.length > 0) {
                dataCache = {
                    countries: stored.countries,
                    currentBooks: stored.currentBooks || [],
                    booksRead: stored.booksRead || []
                };
            } else {
                // Fall back to built-in encoded data
                const defaultCountries = decode64(encryptedData.countries).split('\n').map(s => s.trim()).filter(Boolean);
                const defaultBooks = decode64(encryptedData.books).split('\n').map(s => s.trim()).filter(Boolean);
                dataCache = {
                    countries: defaultCountries,
                    currentBooks: [defaultBooks[0]].filter(Boolean),
                    booksRead: defaultBooks.slice(1).filter(Boolean)
                };
            }
            
            // Clear encoded data after decoding
            setTimeout(() => {
                encryptedData.countries = '';
                encryptedData.books = '';
            }, 1000);
        }
        
        // Return copy to prevent direct access to cached data
        return {
            countries: [...dataCache.countries],
            currentBooks: [...(dataCache.currentBooks || [])],
            booksRead: [...(dataCache.booksRead || [])]
        };
    }
    
    // Expose limited interface
    window._SecureData = {
        authenticate: authenticate,
        getData: getSecureData,
        updateData: updateUserData,
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