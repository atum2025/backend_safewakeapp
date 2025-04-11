#!/bin/bash

# Cores para saída de console
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
RESET='\033[0m'

function show_help {
  echo -e "${CYAN}SafeWake - Gerenciador Capacitor${RESET}"
  echo
  echo -e "Uso: ./capacitor-management.sh [comando]"
  echo
  echo -e "Comandos disponíveis:"
  echo -e "  ${GREEN}setup${RESET}      Configura o projeto para Android e iOS"
  echo -e "  ${GREEN}sync${RESET}       Sincroniza os arquivos com as plataformas nativas"
  echo -e "  ${GREEN}android${RESET}    Prepara e abre o projeto no Android Studio"
  echo -e "  ${GREEN}ios${RESET}        Prepara e abre o projeto no Xcode"
  echo -e "  ${GREEN}help${RESET}       Mostra esta ajuda"
  echo
}

function setup {
  echo -e "${CYAN}=== Configurando Capacitor para SafeWake ===${RESET}"
  
  # Verificar se o build foi feito
  if [ ! -d "./dist" ]; then
    echo -e "${YELLOW}Executando build do projeto...${RESET}"
    npm run build
  fi
  
  # Inicializar o Capacitor (se necessário)
  if [ ! -d "./android" ] && [ ! -d "./ios" ]; then
    echo -e "${YELLOW}Inicializando Capacitor...${RESET}"
    npx cap init SafeWake com.safewake.app --web-dir=dist
  fi
  
  # Adicionar plataformas
  if [ ! -d "./android" ]; then
    echo -e "${YELLOW}Adicionando plataforma Android...${RESET}"
    npx cap add android
  fi
  
  if [ ! -d "./ios" ]; then
    echo -e "${YELLOW}Adicionando plataforma iOS...${RESET}"
    npx cap add ios
  fi
  
  # Sincronizar arquivos com as plataformas
  sync
  
  echo -e "${GREEN}=== Configuração concluída! ===${RESET}"
  echo
  echo -e "${CYAN}Para desenvolver/testar no Android:${RESET}"
  echo -e "  Execute: ./capacitor-management.sh android"
  echo
  echo -e "${CYAN}Para desenvolver/testar no iOS:${RESET}"
  echo -e "  Execute: ./capacitor-management.sh ios"
  echo
}

function sync {
  echo -e "${YELLOW}Sincronizando arquivos com plataformas nativas...${RESET}"
  npx cap sync
  echo -e "${GREEN}Sincronização concluída!${RESET}"
}

function prepare_android {
  echo -e "${CYAN}Preparando projeto Android...${RESET}"
  
  # Verificar se existe build
  if [ ! -d "./dist" ]; then
    echo -e "${YELLOW}Executando build do projeto...${RESET}"
    npm run build
  fi
  
  # Verificar se Android já foi configurado
  if [ ! -d "./android" ]; then
    echo -e "${YELLOW}Android ainda não configurado. Executando setup...${RESET}"
    setup
    return
  fi
  
  # Sincronizar e abrir Android Studio
  sync
  echo -e "${YELLOW}Abrindo projeto no Android Studio...${RESET}"
  npx cap open android
}

function prepare_ios {
  echo -e "${CYAN}Preparando projeto iOS...${RESET}"
  
  # Verificar se existe build
  if [ ! -d "./dist" ]; then
    echo -e "${YELLOW}Executando build do projeto...${RESET}"
    npm run build
  fi
  
  # Verificar se iOS já foi configurado
  if [ ! -d "./ios" ]; then
    echo -e "${YELLOW}iOS ainda não configurado. Executando setup...${RESET}"
    setup
    return
  fi
  
  # Sincronizar e abrir Xcode
  sync
  echo -e "${YELLOW}Abrindo projeto no Xcode...${RESET}"
  npx cap open ios
}

# Verificar argumentos
if [ $# -eq 0 ]; then
  show_help
  exit 0
fi

# Processar comando
case "$1" in
  "setup")
    setup
    ;;
  "sync")
    sync
    ;;
  "android")
    prepare_android
    ;;
  "ios")
    prepare_ios
    ;;
  "help")
    show_help
    ;;
  *)
    echo -e "${RED}Comando desconhecido: $1${RESET}"
    show_help
    exit 1
    ;;
esac

exit 0
