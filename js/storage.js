/**
 * Discipline Nutrition - Couche d'abstraction du stockage
 */
class StorageManager {
    constructor(dbName = 'disciplineNutritionDB', storeName = 'state') {
        this.dbName = dbName;
        this.storeName = storeName;
        this.db = null;
    }

    async _request(op, ...args) {
        const db = await this.init();
        if (!db) return op === 'get' ? (localStorage.getItem(args[0]) ? JSON.parse(localStorage.getItem(args[0])) : null) : null;
        
        return new Promise((resolve, reject) => {
            const tx = db.transaction([this.storeName], op === 'get' ? 'readonly' : 'readwrite');
            const store = tx.objectStore(this.storeName);
            const req = store[op](...args);
            req.onsuccess = () => resolve(op === 'get' ? req.result : true);
            req.onerror = () => reject(req.error);
        });
    }

    async init() {
        if (this.db) return this.db;
        return new Promise(resolve => {
            const req = indexedDB.open(this.dbName, 1);
            req.onupgradeneeded = e => !e.target.result.objectStoreNames.contains(this.storeName) && e.target.result.createObjectStore(this.storeName);
            req.onsuccess = e => resolve(this.db = e.target.result);
            req.onerror = () => resolve(null);
        });
    }

    get(key) { return this._request('get', key); }
    set(key, val) { 
        if (!this.db) localStorage.setItem(key, JSON.stringify(val));
        return this._request('put', val, key); 
    }
    delete(key) { 
        if (!this.db) localStorage.removeItem(key);
        return this._request('delete', key); 
    }

    async migrateFromLocalStorage(key) {
        const data = localStorage.getItem(key);
        if (data) {
            try {
                await this.set(key, JSON.parse(data));
                return true;
            } catch (e) { return false; }
        }
        return false;
    }
}

window.storage = new StorageManager();
