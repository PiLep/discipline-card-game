/**
 * Discipline Nutrition - Couche d'abstraction du stockage
 * Gère localStorage et IndexedDB de manière transparente
 */

class StorageManager {
    constructor(dbName = 'disciplineNutritionDB', storeName = 'state') {
        this.dbName = dbName;
        this.storeName = storeName;
        this.db = null;
    }

    /**
     * Initialise la connexion à IndexedDB
     */
    async init() {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => {
                console.warn("IndexedDB non disponible, repli sur localStorage");
                resolve(null);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };
        });
    }

    /**
     * Sauvegarde une valeur
     */
    async set(key, value) {
        const db = await this.init();
        
        if (db) {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.put(value, key);

                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(request.error);
            });
        } else {
            // Fallback localStorage
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        }
    }

    /**
     * Récupère une valeur
     */
    async get(key) {
        const db = await this.init();

        if (db) {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);
                const request = store.get(key);

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } else {
            // Fallback localStorage
            const value = localStorage.getItem(key);
            try {
                return value ? JSON.parse(value) : null;
            } catch (e) {
                return value;
            }
        }
    }

    /**
     * Supprime une valeur
     */
    async delete(key) {
        const db = await this.init();

        if (db) {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.delete(key);

                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(request.error);
            });
        } else {
            localStorage.removeItem(key);
            return true;
        }
    }

    /**
     * Migre les données de localStorage vers IndexedDB si nécessaire
     */
    async migrateFromLocalStorage(key) {
        const localData = localStorage.getItem(key);
        if (localData) {
            console.log(`Migration de ${key} vers IndexedDB...`);
            try {
                const parsed = JSON.parse(localData);
                await this.set(key, parsed);
                // On garde localStorage pour l'instant par sécurité, 
                // mais on pourrait le supprimer : localStorage.removeItem(key);
                console.log("Migration réussie.");
                return true;
            } catch (e) {
                console.error("Échec de la migration:", e);
                return false;
            }
        }
        return false;
    }
}

// Instance globale exportée (si module) ou globale (si script classique)
window.storage = new StorageManager();
