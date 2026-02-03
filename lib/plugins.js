import { readdirSync, existsSync, readFileSync, watch, statSync } from 'fs'
import { join, resolve, dirname, relative, sep, basename } from 'path'
import { format } from 'util'
import syntaxerror from 'syntax-error'
import importFile from './import.js'
import Helper from './helper.js'

const __dirname = Helper.__dirname(import.meta)
const pluginFolder = Helper.__dirname(join(__dirname, './plugins/index'))
const pluginFilter = filename => /\.(mc)?js$/.test(filename)

let watcher, plugins, pluginFolders = []
watcher = {}
plugins = new Map() // Cambiamos a Map para mejor manejo de claves

/**
 * Lee recursivamente todos los archivos en un directorio
 */
function readdirRecursive(dir) {
    const results = []
    
    function scan(currentDir) {
        try {
            const items = readdirSync(currentDir)
            
            for (const item of items) {
                const fullPath = join(currentDir, item)
                
                try {
                    const stat = statSync(fullPath)
                    
                    if (stat.isDirectory()) {
                        scan(fullPath)
                    } else if (stat.isFile()) {
                        results.push(fullPath)
                    }
                } catch (err) {
                    console.error(`Error accediendo a ${fullPath}:`, err)
                }
            }
        } catch (error) {
            console.error(`Error leyendo directorio ${currentDir}:`, error)
        }
    }
    
    scan(dir)
    return results
}

/**
 * Obtiene la ruta relativa del plugin y normaliza separadores
 */
function getPluginKey(filePath, baseFolder) {
    const relativePath = relative(baseFolder, filePath)
    return relativePath.replace(/\\/g, '/')
}

/**
 * Valida y parsea el plugin
 */
function parsePluginModule(module) {
    if (!module) return null
    
    // Si el módulo es una función
    if (typeof module === 'function') {
        return {
            type: 'function',
            execute: module
        }
    }
    
    // Si el módulo tiene una propiedad default
    if (module && typeof module === 'object' && 'default' in module) {
        return module.default
    }
    
    // Si el módulo ya tiene la estructura esperada
    if (module && typeof module === 'object') {
        return module
    }
    
    // Para otros casos, envolver en estructura estándar
    return {
        type: 'plugin',
        handler: module,
        name: module.name || 'unknown'
    }
}

/**
 * Carga un plugin individual
 */
async function loadPlugin(filePath, baseFolder, conn) {
    const pluginKey = getPluginKey(filePath, baseFolder)
    
    try {
        // Verificar que exista
        if (!existsSync(filePath)) {
            conn?.logger.warn(`Plugin no encontrado: ${filePath}`)
            return null
        }
        
        // Validar sintaxis
        const code = readFileSync(filePath, 'utf-8')
        const syntaxError = syntaxerror(code, pluginKey, {
            sourceType: 'module',
            allowAwaitOutsideFunction: true,
            allowReturnOutsideFunction: false
        })
        
        if (syntaxError) {
            conn?.logger.error(`❌ Error de sintaxis en ${pluginKey}:`, format(syntaxError))
            return null
        }
        
        // Importar el módulo
        const module = await importFile(globalThis.__filename(filePath))
        if (!module) {
            conn?.logger.warn(`Plugin vacío: ${pluginKey}`)
            return null
        }
        
        // Parsear el módulo
        const parsedModule = parsePluginModule(module)
        if (!parsedModule) {
            conn?.logger.warn(`Plugin inválido: ${pluginKey}`)
            return null
        }
        
        // Crear estructura del plugin
        const pluginData = {
            key: pluginKey,
            name: basename(filePath, '.js'),
            fullPath: filePath,
            folder: getPluginKey(dirname(filePath), baseFolder),
            module: parsedModule,
            loadedAt: new Date(),
            stats: {
                size: statSync(filePath).size,
                modified: statSync(filePath).mtime
            }
        }
        
        conn?.logger.info(`✅ Plugin cargado: ${pluginKey}`)
        return pluginData
        
    } catch (error) {
        conn?.logger.error(`💥 Error cargando plugin ${pluginKey}:`, error)
        return null
    }
}

/**
 * Inicializa el sistema de plugins
 */
async function filesInit(pluginFolder = pluginFolder, pluginFilter = pluginFilter, conn) {
    const folder = resolve(pluginFolder)
    
    // Si ya estamos observando esta carpeta, no hacer nada
    if (folder in watcher) {
        conn?.logger.warn(`La carpeta ${folder} ya está siendo observada`)
        return plugins
    }
    
    pluginFolders.push(folder)
    conn?.logger.info(`📁 Inicializando plugins desde: ${folder}`)
    
    try {
        // Limpiar plugins existentes de esta carpeta
        const folderPrefix = folder + sep
        for (const [key, plugin] of plugins.entries()) {
            if (plugin.fullPath.startsWith(folderPrefix)) {
                plugins.delete(key)
            }
        }
        
        // Buscar todos los archivos de plugin recursivamente
        const allFiles = readdirRecursive(folder)
        const pluginFiles = allFiles.filter(filePath => pluginFilter(filePath))
        
        conn?.logger.info(`🔍 Encontrados ${pluginFiles.length} archivos de plugin`)
        
        // Cargar plugins en paralelo con límite de concurrencia
        const BATCH_SIZE = 5
        for (let i = 0; i < pluginFiles.length; i += BATCH_SIZE) {
            const batch = pluginFiles.slice(i, i + BATCH_SIZE)
            await Promise.all(
                batch.map(async filePath => {
                    const pluginData = await loadPlugin(filePath, folder, conn)
                    if (pluginData) {
                        plugins.set(pluginData.key, pluginData)
                    }
                })
            )
        }
        
        // Configurar watcher recursivo
        const watching = watch(folder, { 
            recursive: true,
            persistent: true
        }, (eventType, filename) => {
            if (filename) {
                reload(conn, folder, pluginFilter, eventType, filename)
            }
        })
        
        // Manejar errores del watcher
        watching.on('error', (error) => {
            conn?.logger.error('❌ Error en el watcher de plugins:', error)
        })
        
        watching.on('close', () => {
            conn?.logger.info(`👋 Watcher cerrado para: ${folder}`)
            deletePluginFolder(folder, true)
        })
        
        watcher[folder] = watching
        conn?.logger.info(`👀 Observando cambios en: ${folder}`)
        
        // Log resumen
        const categories = getPluginCategories()
        conn?.logger.info(`🎯 Plugins cargados: ${plugins.size}`)
        if (categories.length > 0) {
            conn?.logger.info(`📂 Categorías: ${categories.join(', ')}`)
        }
        
    } catch (error) {
        conn?.logger.error('💥 Error inicializando plugins:', error)
    }
    
    return plugins
}

/**
 * Elimina una carpeta del sistema de plugins
 */
function deletePluginFolder(folder, isAlreadyClosed = false) {
    const resolved = resolve(folder)
    
    if (!(resolved in watcher)) {
        return false
    }
    
    // Eliminar todos los plugins de esta carpeta
    const folderPrefix = resolved + sep
    let removedCount = 0
    
    for (const [key, plugin] of plugins.entries()) {
        if (plugin.fullPath.startsWith(folderPrefix)) {
            plugins.delete(key)
            removedCount++
        }
    }
    
    // Cerrar watcher si no está ya cerrado
    if (!isAlreadyClosed && watcher[resolved]) {
        watcher[resolved].close()
    }
    
    delete watcher[resolved]
    const index = pluginFolders.indexOf(resolved)
    if (index > -1) {
        pluginFolders.splice(index, 1)
    }
    
    return removedCount
}

/**
 * Recarga un plugin cuando se detectan cambios
 */
async function reload(conn, pluginFolder = pluginFolder, pluginFilter = pluginFilter, eventType, filename) {
    if (!filename) return
    
    const fullPath = resolve(pluginFolder, filename)
    
    try {
        // Ignorar si es un directorio
        if (existsSync(fullPath) && statSync(fullPath).isDirectory()) {
            return
        }
    } catch (error) {
        return
    }
    
    // Verificar si es un archivo de plugin
    if (!pluginFilter(filename)) return
    
    const pluginKey = getPluginKey(fullPath, pluginFolder)
    const existingPlugin = plugins.get(pluginKey)
    
    // Determinar el tipo de evento
    if (eventType === 'rename' && !existsSync(fullPath)) {
        // Archivo eliminado
        if (existingPlugin) {
            plugins.delete(pluginKey)
            conn?.logger.warn(`🗑️ Plugin eliminado: ${pluginKey}`)
        }
        return
    }
    
    // Archivo modificado o creado
    if (!existsSync(fullPath)) return
    
    // Pequeña espera para evitar conflictos de escritura
    await new Promise(resolve => setTimeout(resolve, 100))
    
    try {
        const pluginData = await loadPlugin(fullPath, pluginFolder, conn)
        
        if (pluginData) {
            plugins.set(pluginKey, pluginData)
            
            if (existingPlugin) {
                conn?.logger.info(`🔄 Plugin actualizado: ${pluginKey}`)
            } else {
                conn?.logger.info(`✨ Nuevo plugin: ${pluginKey}`)
            }
        }
    } catch (error) {
        conn?.logger.error(`💥 Error recargando plugin ${pluginKey}:`, error)
    }
}

/**
 * Obtiene plugins por categoría/folder
 */
function getPluginsByFolder(folderPath) {
    const result = new Map()
    const searchKey = folderPath.endsWith('/') ? folderPath : folderPath + '/'
    
    for (const [key, plugin] of plugins.entries()) {
        if (key.startsWith(searchKey) || plugin.folder === folderPath) {
            result.set(key, plugin)
        }
    }
    
    return result
}

/**
 * Obtiene todas las categorías únicas de plugins
 */
function getPluginCategories() {
    const categories = new Set()
    
    for (const plugin of plugins.values()) {
        if (plugin.folder && plugin.folder !== '.') {
            categories.add(plugin.folder)
        }
    }
    
    return Array.from(categories).sort()
}

/**
 * Busca plugins por nombre (parcial)
 */
function searchPlugins(query) {
    const results = new Map()
    const lowerQuery = query.toLowerCase()
    
    for (const [key, plugin] of plugins.entries()) {
        if (
            key.toLowerCase().includes(lowerQuery) ||
            plugin.name.toLowerCase().includes(lowerQuery)
        ) {
            results.set(key, plugin)
        }
    }
    
    return results
}

/**
 * Obtiene estadísticas de plugins
 */
function getPluginStats() {
    const stats = {
        total: plugins.size,
        byCategory: {},
        errors: 0,
        totalSize: 0
    }
    
    for (const plugin of plugins.values()) {
        // Contar por categoría
        const category = plugin.folder || 'root'
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1
        
        // Sumar tamaño total
        stats.totalSize += plugin.stats.size || 0
    }
    
    return stats
}

/**
 * Obtiene un plugin específico por su clave
 */
function getPlugin(pluginKey) {
    return plugins.get(pluginKey)
}

/**
 * Lista todos los plugins disponibles
 */
function listPlugins(format = 'simple') {
    if (format === 'detailed') {
        const list = []
        for (const [key, plugin] of plugins.entries()) {
            list.push({
                key,
                name: plugin.name,
                folder: plugin.folder,
                loaded: plugin.loadedAt.toISOString(),
                size: plugin.stats.size
            })
        }
        return list
    }
    
    return Array.from(plugins.keys()).sort()
}

/**
 * Deshabilita temporalmente un plugin (sin eliminarlo)
 */
function disablePlugin(pluginKey) {
    const plugin = plugins.get(pluginKey)
    if (plugin) {
        plugin.disabled = true
        plugin.disabledAt = new Date()
        return true
    }
    return false
}

/**
 * Habilita un plugin previamente deshabilitado
 */
function enablePlugin(pluginKey) {
    const plugin = plugins.get(pluginKey)
    if (plugin && plugin.disabled) {
        plugin.disabled = false
        plugin.enabledAt = new Date()
        return true
    }
    return false
}

/**
 * Ejecuta un plugin específico
 */
async function executePlugin(pluginKey, ...args) {
    const plugin = plugins.get(pluginKey)
    
    if (!plugin) {
        throw new Error(`Plugin no encontrado: ${pluginKey}`)
    }
    
    if (plugin.disabled) {
        throw new Error(`Plugin deshabilitado: ${pluginKey}`)
    }
    
    try {
        const module = plugin.module
        
        // Diferentes formas de ejecutar según el tipo de plugin
        if (typeof module === 'function') {
            return await module(...args)
        } else if (module && typeof module.execute === 'function') {
            return await module.execute(...args)
        } else if (module && typeof module.run === 'function') {
            return await module.run(...args)
        } else if (module && typeof module.handler === 'function') {
            return await module.handler(...args)
        } else {
            throw new Error(`Formato de plugin no soportado: ${pluginKey}`)
        }
    } catch (error) {
        console.error(`Error ejecutando plugin ${pluginKey}:`, error)
        throw error
    }
}

/**
 * Limpia todos los plugins de una carpeta específica
 */
function clearPlugins() {
    const size = plugins.size
    plugins.clear()
    return size
}

export {
    pluginFolder,
    pluginFilter,
    plugins,
    watcher,
    pluginFolders,
    filesInit,
    deletePluginFolder,
    reload,
    getPluginsByFolder,
    getPluginCategories,
    searchPlugins,
    getPluginStats,
    getPlugin,
    listPlugins,
    disablePlugin,
    enablePlugin,
    executePlugin,
    clearPlugins
}