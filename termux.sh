#!/data/data/com.termux/files/usr/bin/bash
# Código desarrollado por @Asta_bot - VERSIÓN ACTUALIZADA SEGURA

BOT_DIR="Asta_bot"
BOT_REPO="https://github.com/Fer280809/Asta_bot.git"
DB_FILE="database.json"

# Colores estilo Index.js
MAGENTA='\033[35m'
CYAN='\033[36m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'
BOLD='\033[1m'
RESET='\033[0m'

echo -e "${BOLD}${MAGENTA}"
echo "╔═══════════════════════════════════╗"
echo "║    🔄 ACTUALIZANDO ASTA BOT 🔄    ║"
echo "╚═══════════════════════════════════╝${RESET}"
echo ""

# Función para mostrar archivos modificados
show_changes() {
    echo -e "${BOLD}${CYAN}╔═══════════════════════════════════╗${RESET}"
    echo -e "${BOLD}${CYAN}║   📝 ARCHIVOS ACTUALIZADOS        ║${RESET}"
    echo -e "${BOLD}${CYAN}╚═══════════════════════════════════╝${RESET}\n"

    if [ -d ".git" ]; then
        # Obtener cambios del repositorio remoto
        git fetch origin main 2>/dev/null

        # Listar archivos modificados
        local changes=$(git diff --name-status HEAD origin/main 2>/dev/null)

        if [ -n "$changes" ]; then
            echo "$changes" | while IFS=$'\t' read -r status file; do
                case $status in
                    M)  echo -e "${YELLOW}⟳ Modificado:${RESET} $file" ;;
                    A)  echo -e "${GREEN}✨ Nuevo:${RESET} $file" ;;
                    D)  echo -e "${RED}🗑  Eliminado:${RESET} $file" ;;
                    *)  echo -e "${CYAN}• $status:${RESET} $file" ;;
                esac
            done
            echo ""
        else
            echo -e "${GREEN}✓ No hay cambios nuevos${RESET}\n"
        fi

        # Contar archivos por tipo de cambio
        local modified=$(echo "$changes" | grep -c "^M" 2>/dev/null || echo "0")
        local added=$(echo "$changes" | grep -c "^A" 2>/dev/null || echo "0")
        local deleted=$(echo "$changes" | grep -c "^D" 2>/dev/null || echo "0")

        if [ "$modified" != "0" ] || [ "$added" != "0" ] || [ "$deleted" != "0" ]; then
            echo -e "${BOLD}${CYAN}╔═══════════════════════════════════╗${RESET}"
            echo -e "${BOLD}${CYAN}║       RESUMEN DE CAMBIOS          ║${RESET}"
            echo -e "${BOLD}${CYAN}╚═══════════════════════════════════╝${RESET}"
            echo -e "${YELLOW}⟳ Modificados: ${modified}${RESET}"
            echo -e "${GREEN}✨ Nuevos: ${added}${RESET}"
            echo -e "${RED}🗑  Eliminados: ${deleted}${RESET}"
            echo ""
        fi
    fi
}

# Función para actualizar SIN eliminar carpetas críticas
safe_update() {
    echo -e "${BOLD}${CYAN}📥 Actualizando desde GitHub...${RESET}"
    
    # Verificar si hay cambios pendientes locales
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠ Tienes cambios locales. Haciendo stash...${RESET}"
        git stash
    fi
    
    # Actualizar desde el repositorio remoto
    if git pull origin main; then
        echo -e "${GREEN}✓ Repositorio actualizado${RESET}"
        
        # Si hay stash, intentar aplicar cambios
        if [ -n "$(git stash list)" ]; then
            echo -e "${YELLOW}⚠ Aplicando cambios locales...${RESET}"
            if git stash pop; then
                echo -e "${GREEN}✓ Cambios locales aplicados${RESET}"
            else
                echo -e "${RED}⚠ Conflictos en cambios locales${RESET}"
                echo -e "${YELLOW}Revisa manualmente con: git status${RESET}"
            fi
        fi
    else
        echo -e "${RED}❌ Error al actualizar el repositorio${RESET}"
        return 1
    fi
    
    return 0
}

# Función para verificar e instalar dependencias si es necesario
check_dependencies() {
    echo -e "${BOLD}${CYAN}🔍 Verificando dependencias...${RESET}"
    
    # Verificar si package.json fue modificado
    if git diff --name-only HEAD@{1} HEAD | grep -q "package.json"; then
        echo -e "${YELLOW}⚠ package.json modificado. Actualizando dependencias...${RESET}"
        
        # Verificar si usa yarn o npm
        if [ -f "yarn.lock" ]; then
            echo -e "${CYAN}📦 Usando Yarn para instalar...${RESET}"
            yarn install --ignore-scripts
        else
            echo -e "${CYAN}📦 Usando NPM para instalar...${RESET}"
            npm install --legacy-peer-deps
        fi
        
        echo -e "${GREEN}✓ Dependencias actualizadas${RESET}"
    else
        echo -e "${GREEN}✓ No hay cambios en dependencias${RESET}"
    fi
    echo ""
}

# Función para respaldar y restaurar base de datos
handle_database() {
    # Respaldar database.json si existe
    if [ -e "$DB_FILE" ]; then 
        echo -e "${BOLD}${CYAN}💾 Respaldando base de datos \"$DB_FILE\"...${RESET}"
        cp "$DB_FILE" "$HOME/database_backup.json"
        echo -e "${GREEN}✓ Base de datos respaldada${RESET}\n"
        return 0
    else
        echo -e "${YELLOW}⚠ \"$DB_FILE\" no encontrada${RESET}\n"
        return 1
    fi
}

# ============================= MAIN =============================

# Verificar si estamos en el directorio del bot
if [[ $(basename "$PWD") == "$BOT_DIR" ]]; then
    echo -e "${CYAN}📍 Ubicación actual: Directorio del Bot${RESET}\n"
    
    # Respaldar base de datos si existe
    handle_database
    
    # Mostrar cambios antes de actualizar
    show_changes
    
    # Actualizar de forma segura
    if safe_update; then
        # Verificar dependencias
        check_dependencies
        
        # Restaurar database.json si existía backup
        if [ -e "$HOME/database_backup.json" ]; then
            echo -e "${BOLD}${CYAN}♻️  Restaurando base de datos...${RESET}"
            # Solo restaurar si no hubo conflictos con database.json
            if [ -e "$DB_FILE" ]; then
                echo -e "${YELLOW}⚠ database.json existe. Manteniendo versión actualizada${RESET}"
                rm "$HOME/database_backup.json"
            else
                mv "$HOME/database_backup.json" "$DB_FILE"
                echo -e "${GREEN}✓ Base de datos restaurada${RESET}"
            fi
        fi
        
        echo -e "${BOLD}${GREEN}"
        echo "╔═══════════════════════════════════╗"
        echo "║    ✅ ACTUALIZACIÓN COMPLETA      ║"
        echo "╚═══════════════════════════════════╝${RESET}"
        echo ""
        
        # Preguntar si iniciar el bot
        read -p "¿Iniciar Asta Bot ahora? (s/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            echo -e "${BOLD}${GREEN}"
            echo "╔═══════════════════════════════════╗"
            echo "║    🚀 INICIANDO ASTA BOT 🚀       ║"
            echo "╚═══════════════════════════════════╝${RESET}"
            echo ""
            npm start
        else
            echo -e "${CYAN}📌 Para iniciar manualmente: npm start${RESET}"
        fi
    else
        echo -e "${RED}❌ Error en la actualización${RESET}"
        exit 1
    fi
    
else
    echo -e "${CYAN}📍 Ubicación actual: \"$HOME\"${RESET}\n"
    
    # Verificar si el directorio del bot existe
    if [ -d "$HOME/$BOT_DIR" ]; then
        cd "$HOME/$BOT_DIR"
        
        echo -e "${BOLD}${MAGENTA}📂 Accediendo al directorio del bot...${RESET}\n"
        
        # Respaldar base de datos si existe
        handle_database
        
        # Mostrar cambios antes de actualizar
        show_changes
        
        # Actualizar de forma segura
        if safe_update; then
            # Verificar dependencias
            check_dependencies
            
            # Restaurar database.json si existía backup
            if [ -e "$HOME/database_backup.json" ]; then
                echo -e "${BOLD}${CYAN}♻️  Restaurando base de datos...${RESET}"
                if [ -e "$DB_FILE" ]; then
                    echo -e "${YELLOW}⚠ database.json existe. Manteniendo versión actualizada${RESET}"
                    rm "$HOME/database_backup.json"
                else
                    mv "$HOME/database_backup.json" "$DB_FILE"
                    echo -e "${GREEN}✓ Base de datos restaurada${RESET}"
                fi
            fi
            
            echo -e "${BOLD}${GREEN}"
            echo "╔═══════════════════════════════════╗"
            echo "║    ✅ ACTUALIZACIÓN COMPLETA      ║"
            echo "╚═══════════════════════════════════╝${RESET}"
            echo ""
            
            # Preguntar si iniciar el bot
            read -p "¿Iniciar Asta Bot ahora? (s/n): " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Ss]$ ]]; then
                echo -e "${BOLD}${GREEN}"
                echo "╔═══════════════════════════════════╗"
                echo "║    🚀 INICIANDO ASTA BOT 🚀       ║"
                echo "╚═══════════════════════════════════╝${RESET}"
                echo ""
                npm start
            else
                echo -e "${CYAN}📌 Para iniciar manualmente: cd ~/Asta_bot && npm start${RESET}"
            fi
        else
            echo -e "${RED}❌ Error en la actualización${RESET}"
            exit 1
        fi
        
    else
        echo -e "${YELLOW}⚠ \"$BOT_DIR\" no existe en $HOME${RESET}"
        echo -e "${CYAN}📌 Para clonar el repositorio manualmente:${RESET}"
        echo -e "  cd ~ && git clone $BOT_REPO${RESET}"
        exit 1
    fi
fi