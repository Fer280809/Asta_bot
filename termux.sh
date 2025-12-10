#!/data/data/com.termux/files/usr/bin/bash
# Código desarrollado por @Asta_bot

BOT_DIR="AstaBot"
BOT_REPO="https://github.com/Fer280809/Asta_bot"
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

# Función de instalación limpia
clean_install() {
    echo -e "${BOLD}${CYAN}📦 Instalando dependencias...${RESET}"
    yarn --ignore-scripts 2>/dev/null
    npm install
    echo -e "${GREEN}✓ Dependencias instaladas${RESET}\n"
}

# Verificar si estamos en el directorio del bot
if [[ $(basename "$PWD") == "$BOT_DIR" ]]; then
    if [ -e "$DB_FILE" ]; then 
        echo -e "${BOLD}${CYAN}💾 Respaldando base de datos \"$DB_FILE\"...${RESET}"
        mv "$HOME/$BOT_DIR/$DB_FILE" "$HOME"
        echo -e "${GREEN}✓ Base de datos respaldada${RESET}\n"
        
        echo -e "${BOLD}${MAGENTA}🔄 Clonando última versión del repositorio...${RESET}"
        cd "$HOME"
        rm -rf "$BOT_DIR"
        
        if git clone "$BOT_REPO"; then
            echo -e "${GREEN}✓ Repositorio clonado exitosamente${RESET}\n"
            cd "$HOME/$BOT_DIR"
            
            # Mostrar cambios
            show_changes
            
            clean_install
            
            if [ -e "$HOME/$DB_FILE" ]; then
                echo -e "${BOLD}${CYAN}♻️  Restaurando base de datos...${RESET}"
                mv "$HOME/$DB_FILE" "$HOME/$BOT_DIR/"
                echo -e "${GREEN}✓ Base de datos restaurada${RESET}\n"
            fi
        else
            echo -e "${RED}❌ Error al clonar el repositorio${RESET}"
            exit 1
        fi
        
        echo -e "${BOLD}${GREEN}"
        echo "╔═══════════════════════════════════╗"
        echo "║    🚀 INICIANDO ASTA BOT 🚀       ║"
        echo "╚═══════════════════════════════════╝${RESET}"
        echo ""
        npm start
    else
        echo -e "${YELLOW}⚠ \"$DB_FILE\" no existe, realizando instalación limpia...${RESET}\n"
        cd "$HOME"
        rm -rf "$BOT_DIR"
        
        echo -e "${BOLD}${MAGENTA}🔄 Clonando repositorio...${RESET}"
        if git clone "$BOT_REPO"; then
            echo -e "${GREEN}✓ Repositorio clonado${RESET}\n"
            cd "$HOME/$BOT_DIR"
            show_changes
            clean_install
        else
            echo -e "${RED}❌ Error al clonar el repositorio${RESET}"
            exit 1
        fi
        
        echo -e "${BOLD}${GREEN}"
        echo "╔═══════════════════════════════════╗"
        echo "║    🚀 INICIANDO ASTA BOT 🚀       ║"
        echo "╚═══════════════════════════════════╝${RESET}"
        echo ""
        npm start
    fi
else
    echo -e "${CYAN}📍 Ubicación actual: \"$HOME\"${RESET}\n"
    cd "$HOME"
    
    if [ -e "$HOME/$BOT_DIR" ]; then
        cd "$HOME/$BOT_DIR"
        
        if [ -e "$DB_FILE" ]; then
            echo -e "${BOLD}${CYAN}💾 Respaldando base de datos...${RESET}"
            mv "$HOME/$BOT_DIR/$DB_FILE" "$HOME"
            echo -e "${GREEN}✓ Base de datos respaldada${RESET}\n"
        fi
        
        cd "$HOME"
        echo -e "${BOLD}${MAGENTA}🔄 Actualizando repositorio...${RESET}"
        rm -rf "$BOT_DIR"
        
        if git clone "$BOT_REPO"; then
            echo -e "${GREEN}✓ Repositorio actualizado${RESET}\n"
            cd "$BOT_DIR"
            show_changes
            clean_install
            
            if [ -e "$HOME/$DB_FILE" ]; then
                echo -e "${BOLD}${CYAN}♻️  Restaurando base de datos...${RESET}"
                mv "$HOME/$DB_FILE" "$HOME/$BOT_DIR/"
                echo -e "${GREEN}✓ Base de datos restaurada${RESET}\n"
            fi
        else
            echo -e "${RED}❌ Error al actualizar el repositorio${RESET}"
            exit 1
        fi
        
        echo -e "${BOLD}${GREEN}"
        echo "╔═══════════════════════════════════╗"
        echo "║    🚀 INICIANDO ASTA BOT 🚀       ║"
        echo "╚═══════════════════════════════════╝${RESET}"
        echo ""
        npm start
    else
        echo -e "${YELLOW}⚠ \"$BOT_DIR\" no existe, realizando instalación inicial...${RESET}\n"
        
        echo -e "${BOLD}${MAGENTA}🔄 Clonando repositorio...${RESET}"
        if git clone "$BOT_REPO"; then
            echo -e "${GREEN}✓ Repositorio clonado${RESET}\n"
            cd "$BOT_DIR"
            show_changes
            clean_install
            
            if [ -e "$HOME/$DB_FILE" ]; then
                echo -e "${BOLD}${CYAN}♻️  Rescatando base de datos...${RESET}"
                mv "$HOME/$DB_FILE" "$HOME/$BOT_DIR/"
                echo -e "${GREEN}✓ Base de datos rescatada${RESET}\n"
            fi
        else
            echo -e "${RED}❌ Error al clonar el repositorio${RESET}"
            exit 1
        fi
        
        echo -e "${BOLD}${GREEN}"
        echo "╔═══════════════════════════════════╗"
        echo "║    🚀 INICIANDO ASTA BOT 🚀       ║"
        echo "╚═══════════════════════════════════╝${RESET}"
        echo ""
        npm start
    fi
fi