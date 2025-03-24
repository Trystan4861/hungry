export const localStorageService = {
    /**
     * setSubItem:
     * Establece un sub-item dentro de un objeto JSON almacenado en localStorage.
     * Si el objeto principal no existe, se crea automáticamente.
     *
     * @param subKey - La clave del sub-item a establecer.
     * @param value - El valor del sub-item a establecer.
     * @param key - La clave para el elemento principal en el localStorage (por defecto es 'hungryConfigData').
     */
    setSubItem(subKey: string, value: any, key: string = 'hungryConfigData') {
        if (import.meta.client) {
            let storedData: any = JSON.parse(localStorage.getItem(key) || '{}');
            storedData[subKey] = value;
            localStorage.setItem(key, JSON.stringify(storedData));
        }
    },
    /**
     * getSubItem:
     * Obtiene un sub-item dentro de un objeto JSON almacenado en localStorage.
     *
     * @param subKey - La clave del sub-item a obtener.
     * @param key - La clave para el elemento principal en el localStorage (por defecto es 'hungryConfigData').
     * @returns El valor del sub-item o null si no se encuentra.
     */
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
    /**
     * removeSubItem:
     * Elimina un elemento del localStorage.
     *
     * @param key - La clave del elemento a eliminar (por defecto es 'hungryConfigData').
     */
    removeItem(key: string = 'hungryConfigData') {
        if (import.meta.client) {
            localStorage.removeItem(key);
        }
    },
    /**
     * setItem:
     * Establece un elemento en el localStorage.
     *
     * @param value - El valor del elemento a establecer.
     * @param key - La clave para el elemento en el localStorage (por defecto es 'hungryConfigData').
     * @returns El valor establecido o null si no se puede establecer.
     */
    setItem(value: any, key: string = 'hungryConfigData') {
        if (import.meta.client) {
            localStorage.setItem(key, JSON.stringify(value));
            return value;
        }
        return null;
    },
    /**
     * getItem:
     * Obtiene un elemento del localStorage.
     *
     * @param key - La clave del elemento a obtener (por defecto es 'hungryConfigData').
     * @returns El valor del elemento o null si no se encuentra
     */
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
    /**
    * importData:
    * Importa datos desde un archivo JSON y los guarda en el localStorage bajo la clave especificada.
    *
    * @param data - Los datos a importar.
    * @param key - La clave para el elemento en el localStorage (por defecto es 'hungryConfigData').
    */
    importData(data: any, key: string = 'hungryConfigData') {
        if (import.meta.client) {
            // Si los datos vienen en el formato antiguo (como objeto plano),
            // los guardamos directamente como el valor completo
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        }
        return false;
    },
    /**
     * exportData:
     * Exporta datos desde el localStorage bajo la clave especificada.
     * @param key - La clave del elemento en el localStorage (por defecto es 'hungryConfigData').
     * @returns Los datos exportados o null si no se encuentran.
     */
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
    /**
     * migrateOldData:
     * Migrar datos antiguos almacenados en localStorage a un nuevo formato.
     * @param removeOldKeys - Indica si se deben eliminar las claves antiguas después de la migración.
     * @returns True si se encontraron datos para migrar, false si no se encontraron.
     */
    migrateOldData(removeOldKeys: boolean=false) {
        if (import.meta.client) {
            const keys = ['productos', 'supermercados', 'categorias', 'loginData', 'defaultTabActive', 'fullScreen', 'appName', 'maxLenght', 'alturaDisponible'];
            let hungryConfigData: any = {};
            let dataFound = false;
            const existingData = localStorage.getItem('hungryConfigData');
            if (existingData)  // Verificar si ya hay datos en el formato viejo
                hungryConfigData = JSON.parse(existingData);
            keys.forEach(key => { // Migrar cada clave antigua
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
            if (dataFound) { // Si encontramos datos para migrar, guardarlos en el nuevo formato
                localStorage.setItem('hungryConfigData', JSON.stringify(hungryConfigData));
                if (removeOldKeys)
                    keys.forEach(key => localStorage.removeItem(key));
                return true;
            }
            return false;
        }
        return false;
    }
}