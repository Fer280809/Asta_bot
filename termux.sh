#!/data/data/com.termux/files/usr/bin/bash

# ============================================
# termux.sh - Script de actualización para ASTA_BOT
# Repositorio: Fer280809/Asta_bot
# ============================================

# Colores para mensajes
RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
MAGENTA='\033[1;35m'
CYAN='\033[1;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Función para mostrar mensajes con colores
msg() {
    echo -e "${GREEN}[ASTA_BOT]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[ADVERTENCIA]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Función para mostrar banner
show_banner() {
    clear
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════╗"
    echo "║      █████╗ ███████╗████████╗ █████╗            ║"
    echo "║     ██╔══██╗██╔════╝╚══██╔══╝██╔══██╗           ║"
    echo "║     ███████║███████╗   ██║   ███████║           ║"
    echo "║     ██╔══██║╚════██║   ██║   ██╔══██║           ║"
    echo "║     ██║  ██║███████║   ██║   ██║  ██║           ║"
    echo "║     ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝           ║"
    echo "║           ASTA_BOT - ACTUALIZADOR RÁPIDO        ║"
    echo "╚══════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo "Repositorio: ${MAGENTA}Fer280809/Asta_bot${NC}"
    echo "Versión del script: 2.0"
    echo "======================================================"
}

# Función para verificar dependencias
check_dependencies() {
    msg "Verificando dependencias..."
    
    # Verificar si git está instalado
    if ! command -v git &> /dev/null; then
        error "Git no está instalado."
        msg "Instalando git..."
        pkg install git -y
    fi
    
    # Verificar si node está instalado
    if ! command -v node &> /dev/null; then
        error "Node.js no está instalado."
        msg "Instalando Node.js..."
        pkg install nodejs -y
    fi
    
    # Verificar si npm está instalado
    if ! command -v npm &> /dev/null; then
        error "npm no está instalado."
        msg "Instalando npm..."
        pkg install npm -y
    fi
    
    # Verificar si pm2 está instalado (opcional)
    if ! command -v pm2 &> /dev/null; then
        warning "PM2 no está instalado (recomendado para producción)."
        read -p "¿Instalar PM2? (y/n): " install_pm2
        if [[ $install_pm2 == "y" || $install_pm2 == "Y" ]]; then
            msg "Instalando PM2..."
            npm install pm2 -g
        fi
    fi
    
    msg "Dependencias verificadas ✓"
}

# Función para hacer backup de archivos importantes
backup_files() {
    msg "Creando backup de archivos importantes..."
    
    # Crear directorio de backup si no existe
    BACKUP_DIR="/data/data/com.termux/files/home/asta_bot_backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p $BACKUP_DIR
    
    # Archivos importantes a respaldar
    important_files=(
        "lib/database.js"
        "lib/setting.js"  # Cambiado de config.js a setting.js
        "lib/settings.js"
        "lib/economy_codes.json"
        "lib/gacha_users.json"
        "lib/characters.json"
    )
    
    for file in "${important_files[@]}"; do
        if [ -f "/data/data/com.termux/files/home/Asta_bot/$file" ]; then  # Cambiado de asta a Asta_bot
            cp "/data/data/com.termux/files/home/Asta_bot/$file" "$BACKUP_DIR/"
            info "  Backup: $file"
        fi
    done
    
    # Backup de configuración del bot si existe
    if [ -f "/data/data/com.termux/files/home/Asta_bot/setting.js" ]; then  # Cambiado de config.js a setting.js
        cp "/data/data/com.termux/files/home/Asta_bot/setting.js" "$BACKUP_DIR/"
    fi
    
    msg "Backup creado en: $BACKUP_DIR"
}

# Función para actualizar desde GitHub
update_from_github() {
    msg "Actualizando desde GitHub..."
    
    cd /data/data/com.termux/files/home/Asta_bot
    
    # Verificar si es un repositorio git
    if [ ! -d ".git" ]; then
        error "No es un repositorio git. Clonando desde cero..."
        cd /data/data/com.termux/files/home
        if [ -d "Asta_bot" ]; then  # Cambiado de asta a Asta_bot
            mv Asta_bot Asta_bot_old_$(date +%Y%m%d_%H%M%S)  # Cambiado de asta a Asta_bot
        fi
        git clone https://github.com/Fer280809/Asta_bot.git
        cd Asta_bot  # Cambiado de asta a Asta_bot
    fi
    
    # Guardar cambios locales si existen
    if git status --porcelain | grep -q "."; then
        warning "Hay cambios locales sin guardar."
        git status
        read -p "¿Deseas guardar los cambios? (y/n): " save_changes
        
        if [[ $save_changes == "y" || $save_changes == "Y" ]]; then
            git add .
            read -p "Mensaje del commit: " commit_msg
            git commit -m "$commit_msg"
        else
            warning "Descartando cambios locales..."
            git stash
        fi
    fi
    
    # Obtener la rama actual
    CURRENT_BRANCH=$(git branch --show-current)
    info "Rama actual: $CURRENT_BRANCH"
    
    # Actualizar desde el repositorio remoto
    msg "Descargando actualizaciones..."
    git fetch origin
    
    # Verificar si hay cambios
    LOCAL_HASH=$(git rev-parse HEAD)
    REMOTE_HASH=$(git rev-parse origin/$CURRENT_BRANCH)
    
    if [ "$LOCAL_HASH" = "$REMOTE_HASH" ]; then
        msg "Ya estás en la versión más reciente ✓"
        return 0
    fi
    
    # Mostrar cambios
    msg "Cambios encontrados:"
    git log --oneline $LOCAL_HASH..origin/$CURRENT_BRANCH
    
    read -p "¿Continuar con la actualización? (y/n): " confirm_update
    
    if [[ $confirm_update == "y" || $confirm_update == "Y" ]]; then
        # Actualizar código
        msg "Aplicando actualizaciones..."
        git pull origin $CURRENT_BRANCH
        
        if [ $? -eq 0 ]; then
            msg "Actualización completada ✓"
            return 0
        else
            error "Error al actualizar. Hay conflictos."
            
            # Mostrar archivos con conflictos
            conflicted_files=$(git diff --name-only --diff-filter=U)
            if [ ! -z "$conflicted_files" ]; then
                warning "Archivos con conflictos:"
                echo "$conflicted_files"
                
                read -p "¿Deseas resolver conflictos manualmente? (y/n): " resolve_conflicts
                if [[ $resolve_conflicts == "y" || $resolve_conflicts == "Y" ]]; then
                    for file in $conflicted_files; do
                        info "Editando: $file"
                        nano "$file"
                        git add "$file"
                    done
                    git commit -m "Resueltos conflictos de fusión"
                    msg "Conflictos resueltos ✓"
                fi
            fi
            return 1
        fi
    else
        warning "Actualización cancelada."
        return 2
    fi
}

# Función para instalar/actualizar dependencias npm
install_npm_dependencies() {
    msg "Instalando dependencias npm..."
    
    cd /data/data/com.termux/files/home/Asta_bot
    
    if [ -f "package.json" ]; then
        # Verificar si hay package-lock.json
        if [ -f "package-lock.json" ]; then
            rm package-lock.json
        fi
        
        # Instalar/actualizar dependencias
        npm install
        
        if [ $? -eq 0 ]; then
            msg "Dependencias npm instaladas ✓"
        else
            error "Error al instalar dependencias npm."
            warning "Intentando con --force..."
            npm install --force
        fi
    else
        warning "No se encontró package.json"
    fi
}

# Función para verificar estructura de archivos
check_file_structure() {
    msg "Verificando estructura de archivos..."
    
    cd /data/data/com.termux/files/home/Asta_bot  # Cambiado de asta a Asta_bot
    
    # Archivos esenciales que deben existir
    essential_files=(
        "index.js"
        "main.js"
        "lib/"
        "plugins/"
    )
    
    for item in "${essential_files[@]}"; do
        if [ -e "$item" ]; then
            info "  ✓ $item"
        else
            error "  ✗ $item (FALTANTE)"
        fi
    done
    
    # Verificar archivos del sistema RPG si existen
    if [ -d "lib/rpg" ]; then
        msg "Sistema RPG detectado..."
        rpg_files=(
            "lib/rpg/resource-system.js"
            "lib/rpg/init-resources.js"
            "lib/rpg/mission-system.js"
        )
        
        for file in "${rpg_files[@]}"; do
            if [ -f "$file" ]; then
                info "  ✓ $file"
            else
                warning "  ⚠ $file (opcional)"
            fi
        done
    fi
}

# Función para arreglar permisos
fix_permissions() {
    msg "Arreglando permisos..."
    
    cd /data/data/com.termux/files/home/Asta_bot  # Cambiado de asta a Asta_bot
    
    # Dar permisos de ejecución a scripts
    chmod +x *.sh 2>/dev/null
    
    # Dar permisos a archivos JavaScript
    find . -name "*.js" -type f -exec chmod 644 {} \;
    
    # Dar permisos de lectura a todos
    chmod -R a+r .
    
    msg "Permisos arreglados ✓"
}

# Función para iniciar el bot
start_bot() {
    msg "Iniciando el bot..."
    
    cd /data/data/com.termux/files/home/Asta_bot  # Cambiado de asta a Asta_bot
    
    # Verificar si pm2 está instalado
    if command -v pm2 &> /dev/null; then
        info "Usando PM2 para gestión de procesos..."
        
        # Verificar si ya está corriendo con pm2
        if pm2 list | grep -q "asta_bot"; then
            msg "Reiniciando bot con PM2..."
            pm2 restart asta_bot
        else
            msg "Iniciando bot con PM2..."
            pm2 start index.js --name asta_bot
        fi
        
        pm2 save
        pm2 logs asta_bot --lines 50
    else
        warning "PM2 no instalado. Iniciando manualmente..."
        
        # Matar proceso anterior si existe
        pkill -f "node.*Asta_bot" 2>/dev/null  # Cambiado de asta a Asta_bot
        
        # Iniciar nuevo proceso
        nohup node index.js > asta_bot.log 2>&1 &
        
        info "Bot iniciado en segundo plano."
        info "Ver logs: tail -f asta_bot.log"
        info "Detener bot: pkill -f \"node.*Asta_bot\""
    fi
}

# Función para mostrar logs
show_logs() {
    msg "Mostrando logs..."
    
    cd /data/data/com.termux/files/home/Asta_bot  # Cambiado de asta a Asta_bot
    
    if [ -f "asta_bot.log" ]; then  # Cambiado de asta.log a asta_bot.log
        tail -f -n 50 asta_bot.log
    else
        warning "No se encontró archivo de logs."
        info "Los logs pueden estar en otro lugar o el bot no se ha ejecutado."
    fi
}

# Función para limpiar caché
clean_cache() {
    msg "Limpiando caché..."
    
    cd /data/data/com.termux/files/home/Asta_bot  # Cambiado de asta a Asta_bot
    
    # Limpiar node_modules si es muy grande
    if [ -d "node_modules" ]; then
        NODE_SIZE=$(du -sh node_modules | cut -f1)
        warning "node_modules ocupa: $NODE_SIZE"
        
        read -p "¿Limpiar node_modules y reinstalar? (y/n): " clean_node
        
        if [[ $clean_node == "y" || $clean_node == "Y" ]]; then
            rm -rf node_modules
            rm -f package-lock.json
            msg "node_modules eliminado."
            install_npm_dependencies
        fi
    fi
    
    # Limpiar logs antiguos
    find . -name "*.log" -type f -mtime +7 -delete 2>/dev/null
    
    # Limpiar backup viejos (más de 7 días)
    find /data/data/com.termux/files/home -name "asta_bot_backup_*" -type d -mtime +7 -exec rm -rf {} \; 2>/dev/null  # Cambiado de asta_backup_ a asta_bot_backup_
    
    msg "Caché limpiado ✓"
}

# Función para menú principal
show_menu() {
    while true; do
        echo -e "\n${CYAN}════════════════ MENÚ PRINCIPAL ════════════════${NC}"
        echo -e "${GREEN}1.${NC} Actualizar desde GitHub (completo)"
        echo -e "${GREEN}2.${NC} Solo instalar dependencias"
        echo -e "${GREEN}3.${NC} Verificar estructura de archivos"
        echo -e "${GREEN}4.${NC} Iniciar/Reiniciar bot"
        echo -e "${GREEN}5.${NC} Ver logs en tiempo real"
        echo -e "${GREEN}6.${NC} Limpiar caché y backups viejos"
        echo -e "${GREEN}7.${NC} Backup de archivos importantes"
        echo -e "${GREEN}8.${NC} Arreglar permisos"
        echo -e "${GREEN}9.${NC} Estado del sistema"
        echo -e "${GREEN}0.${NC} Salir"
        echo -e "${CYAN}══════════════════════════════════════════════════${NC}"
        
        read -p "Selecciona una opción (0-9): " choice
        
        case $choice in
            1)
                backup_files
                update_from_github
                install_npm_dependencies
                fix_permissions
                check_file_structure
                ;;
            2)
                install_npm_dependencies
                ;;
            3)
                check_file_structure
                ;;
            4)
                start_bot
                ;;
            5)
                show_logs
                ;;
            6)
                clean_cache
                ;;
            7)
                backup_files
                ;;
            8)
                fix_permissions
                ;;
            9)
                show_system_status
                ;;
            0)
                msg "¡Hasta luego!"
                exit 0
                ;;
            *)
                error "Opción no válida"
                ;;
        esac
        
        read -p "Presiona Enter para continuar..." -n 1
    done
}

# Función para mostrar estado del sistema
show_system_status() {
    echo -e "\n${CYAN}═══════════════ ESTADO DEL SISTEMA ═══════════════${NC}"
    
    # Información del sistema
    echo -e "${GREEN}• Sistema:${NC} $(uname -a)"
    echo -e "${GREEN}• Node.js:${NC} $(node --version)"
    echo -e "${GREEN}• npm:${NC} $(npm --version)"
    echo -e "${GREEN}• Git:${NC} $(git --version)"
    
    # Información del bot
    cd /data/data/com.termux/files/home/Asta_bot  # Cambiado de asta a Asta_bot
    
    if [ -d ".git" ]; then
        CURRENT_BRANCH=$(git branch --show-current)
        LAST_COMMIT=$(git log -1 --format="%h - %s (%cr)")
        echo -e "${GREEN}• Rama actual:${NC} $CURRENT_BRANCH"
        echo -e "${GREEN}• Último commit:${NC} $LAST_COMMIT"
    fi
    
    # Estado del bot
    if command -v pm2 &> /dev/null; then
        if pm2 list | grep -q "asta_bot"; then
            echo -e "${GREEN}• Estado bot:${NC} ${GREEN}ENCENDIDO (PM2)${NC}"
        else
            echo -e "${GREEN}• Estado bot:${NC} ${RED}APAGADO${NC}"
        fi
    else
        # Verificar si hay proceso node corriendo
        if pgrep -f "node.*Asta_bot" > /dev/null; then  # Cambiado de asta a Asta_bot
            echo -e "${GREEN}• Estado bot:${NC} ${GREEN}ENCENDIDO (manual)${NC}"
        else
            echo -e "${GREEN}• Estado bot:${NC} ${RED}APAGADO${NC}"
        fi
    fi
    
    # Espacio en disco
    echo -e "${GREEN}• Espacio disco:${NC}"
    df -h /data/data/com.termux/files/home | tail -1
    
    # Memoria
    echo -e "${GREEN}• Memoria libre:${NC}"
    free -h | grep Mem | awk '{print $4 " de " $2}'
    
    echo -e "${CYAN}══════════════════════════════════════════════════${NC}"
}

# Función para modo automático (sin menú)
auto_mode() {
    msg "Modo automático activado..."
    
    # Verificar dependencias
    check_dependencies
    
    # Hacer backup
    backup_files
    
    # Actualizar desde GitHub
    update_from_github
    if [ $? -eq 0 ]; then
        # Instalar dependencias
        install_npm_dependencies
        
        # Arreglar permisos
        fix_permissions
        
        # Verificar estructura
        check_file_structure
        
        # Preguntar si iniciar bot
        read -p "¿Deseas iniciar el bot ahora? (y/n): " start_now
        
        if [[ $start_now == "y" || $start_now == "Y" ]]; then
            start_bot
        else
            msg "Actualización completada. Usa ${CYAN}./termux.sh${NC} para iniciar el bot."
        fi
    else
        error "Actualización falló. Revisa los errores arriba."
    fi
}

# Función principal
main() {
    show_banner
    
    # Verificar si se pasó argumento para modo automático
    if [ "$1" = "--auto" ] || [ "$1" = "-a" ]; then
        auto_mode
    else
        # Verificar dependencias básicas
        check_dependencies
        
        # Mostrar menú
        show_menu
    fi
}

# Manejar señal de interrupción (Ctrl+C)
trap 'echo -e "\n${RED}Interrumpido por el usuario${NC}"; exit 1' INT

# Ejecutar función principal
main "$@"