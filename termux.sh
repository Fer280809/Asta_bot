# Código desarrollado por @Asta_bot

#!/data/data/com.termux/files/usr/bin/bash
BOT_DIR="AstaBot"
BOT_REPO="https://github.com/Fer280809/Asta_bot"
DB_FILE="database.json"

GREEN='\033[32m'
BOLD='\033[1m'
RESET='\033[0m'

if [[ $(basename "$PWD") == "$BOT_DIR" ]]; then
    if [ -e "$DB_FILE" ]; then 
        echo -e "${BOLD}${GREEN}Moviendo \"$DB_FILE\" a \"$HOME\" y clonando repositorio \"$BOT_REPO\" en \"$HOME\"...${RESET}"
        echo -e "${BOLD}${GREEN}Moving \"$DB_FILE\" to \"$HOME\" and cloning repository \"$BOT_REPO\" into \"$HOME\"...\n${RESET}"
        mv "$HOME/$BOT_DIR/$DB_FILE" "$HOME"
        rm -rf "$HOME/$BOT_DIR"
        git clone "$BOT_REPO"
        cd "$HOME/$BOT_DIR"
        yarn --ignore-scripts
        npm install
        if [ -e "$HOME/$DB_FILE" ]; then
            echo -e "${BOLD}${GREEN}Rescatando archivo \"$DB_FILE\" y moviendo a \"$BOT_DIR\".${RESET}"
            mv "$HOME/$DB_FILE" "$HOME/$BOT_DIR/"
        fi
        echo -e "${BOLD}${GREEN}Iniciando $BOT_DIR...${RESET}"
        npm start
    else
        echo -e "${BOLD}${GREEN}\"$DB_FILE\" no existe en \"$BOT_DIR\", clonando repositorio \"$BOT_REPO\" en \"$HOME\"...${RESET}"
        rm -rf "$HOME/$BOT_DIR"
        git clone "$BOT_REPO"
        cd "$HOME/$BOT_DIR"
        yarn --ignore-scripts
        npm install
        echo -e "${BOLD}${GREEN}Iniciando $BOT_DIR...${RESET}"
        npm start
    fi
else
    echo -e "${BOLD}${GREEN}Ubicación actual: \"$HOME\"${RESET}"
    cd "$HOME"
    if [ -e "$HOME/$BOT_DIR" ]; then
        cd "$HOME/$BOT_DIR"
        if [ -e "$DB_FILE" ]; then
            echo -e "${BOLD}${GREEN}Moviendo \"$DB_FILE\" a \"$HOME\" y clonando repositorio \"$BOT_REPO\" en \"$HOME\"...${RESET}"
            mv "$HOME/$BOT_DIR/$DB_FILE" "$HOME"
            rm -rf "$BOT_DIR"
            git clone "$BOT_REPO"
            cd "$BOT_DIR"
            yarn --ignore-scripts
            npm install
            mv "$HOME/$DB_FILE" "$HOME/$BOT_DIR/"
        fi
        echo -e "${BOLD}${GREEN}Iniciando $BOT_DIR...${RESET}"
        npm start
    else
        echo -e "${BOLD}${GREEN}\"$BOT_DIR\" no existe, clonando repositorio \"$BOT_REPO\" en \"$HOME\"...${RESET}"
        git clone "$BOT_REPO"
        cd "$BOT_DIR"
        yarn --ignore-scripts
        npm install
        if [ -e "$HOME/$DB_FILE" ]; then
            echo -e "${BOLD}${GREEN}Rescatando archivo \"$DB_FILE\" y moviendo a \"$BOT_DIR\".${RESET}"
            mv "$HOME/$DB_FILE" "$HOME/$BOT_DIR/"
        fi
        echo -e "${BOLD}${GREEN}Iniciando $BOT_DIR...${RESET}"
        npm start
    fi
fi
