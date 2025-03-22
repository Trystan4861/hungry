export const localStorageService = {
    setSubItem(subKey: string, value: any, key: string = 'hungryConfigData') {
        if (import.meta.client) {
            let storedData: any = JSON.parse(localStorage.getItem(key) || '{}');
            storedData[subKey] = value;
            localStorage.setItem(key, JSON.stringify(storedData));
        }
    },
    getSubItem(subKey: string, key: string = 'hungryConfigData') {
        if (import.meta.client) {
            let storedData: any = JSON.parse(localStorage.getItem(key) || '{}');
            if (!storedData || !(Object.prototype.hasOwnProperty.call(storedData, subKey))) {
                return null;
            }
            return storedData[subKey];
        }
        return null;
    },
    removeItem(key: string = 'hungryConfigData') {
        if (import.meta.client) {
            localStorage.removeItem(key);
        }
    },
    setItem(value: any, key: string = 'hungryConfigData') {
        if (import.meta.client) {
            localStorage.setItem(key, JSON.stringify(value));
            return value;
        }
        return null;
    },
    getItem(key: string = 'hungryConfigData') {
        if (import.meta.client) {
            const storedData: any = localStorage.getItem(key);
            if (!storedData) {
                return null;
            }
            return JSON.parse(storedData);
        }
        return null;
    },
    importData(data: any, key: string = 'hungryConfigData') {
        if (import.meta.client) {
            // Si los datos vienen en el formato antiguo (como objeto plano),
            // los guardamos directamente como el valor completo
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        }
        return false;
    },
    exportData(key: string = 'hungryConfigData') {
        if (import.meta.client) {
            const storedData: any = localStorage.getItem(key);
            if (!storedData) {
                return null;
            }
            return JSON.parse(storedData);
        }
        return null;
    },
    // Función para migrar datos del formato antiguo al nuevo formato centralizado
    migrateOldData() {
        if (import.meta.client) {
            const keys = ['productos', 'supermercados', 'categorias', 'loginData', 'defaultTabActive', 'fullScreen', 'appName', 'maxLenght', 'alturaDisponible'];
            let hungryConfigData: any = {};
            let dataFound = false;
            
            // Comprobar si ya existe hungryConfigData
            const existingData = localStorage.getItem('hungryConfigData');
            if (existingData) {
                hungryConfigData = JSON.parse(existingData);
            }
            
            // Migrar cada clave antigua
            keys.forEach(key => {
                const oldData = localStorage.getItem(key);
                if (oldData) {
                    try {
                        hungryConfigData[key] = JSON.parse(oldData);
                        dataFound = true;
                    } catch (e) {
                        console.warn(`Error al migrar ${key}:`, e);
                    }
                }
            });
            
            // Si encontramos datos para migrar, guardarlos en el nuevo formato
            if (dataFound) {
                localStorage.setItem('hungryConfigData', JSON.stringify(hungryConfigData));
                
                // Opcional: eliminar las claves antiguas después de migrar
                // keys.forEach(key => localStorage.removeItem(key));
                
                return true;
            }
            
            return false;
        }
        return false;
    }
}