// Script para configuração do Capacitor para iOS e Android
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Cores para saída de console
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

console.log(`${CYAN}=== Configurando Capacitor para SafeWake ===${RESET}`);

// Verificar se o build foi feito
if (!fs.existsSync('./dist')) {
  console.log(`${YELLOW}Executando build do projeto...${RESET}`);
  execSync('npm run build', { stdio: 'inherit' });
}

// Inicializar o Capacitor (se necessário)
if (!fs.existsSync('./android') && !fs.existsSync('./ios')) {
  console.log(`${YELLOW}Inicializando Capacitor...${RESET}`);
  execSync('npx cap init SafeWake com.safewake.app --web-dir=dist', { stdio: 'inherit' });
}

// Adicionar plataformas
if (!fs.existsSync('./android')) {
  console.log(`${YELLOW}Adicionando plataforma Android...${RESET}`);
  execSync('npx cap add android', { stdio: 'inherit' });
}

if (!fs.existsSync('./ios')) {
  console.log(`${YELLOW}Adicionando plataforma iOS...${RESET}`);
  execSync('npx cap add ios', { stdio: 'inherit' });
}

// Sincronizar arquivos com as plataformas
console.log(`${YELLOW}Sincronizando arquivos com plataformas nativas...${RESET}`);
execSync('npx cap sync', { stdio: 'inherit' });

// Configurações adicionais
console.log(`${GREEN}=== Configuração concluída! ===${RESET}`);
console.log(`
${CYAN}Para desenvolver/testar no Android:${RESET}
- Execute: npx cap open android
- Isso abrirá o Android Studio com o projeto

${CYAN}Para desenvolver/testar no iOS:${RESET}
- Execute: npx cap open ios
- Isso abrirá o Xcode com o projeto

${CYAN}Para atualizar após fazer alterações:${RESET}
1. npm run build
2. npx cap sync
3. Abra o projeto nativo novamente
`);