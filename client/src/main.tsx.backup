import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { initCapacitor, setupBackButtonHandler } from "./lib/capacitor";

// Inicializar Capacitor para recursos nativos
document.addEventListener('DOMContentLoaded', () => {
  initCapacitor();
  
  // Configurar manipulador de botão voltar para Android
  setupBackButtonHandler(() => {
    // Personalizar comportamento de voltar se necessário
    return false; // Retornar true interrompe o comportamento padrão
  });
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
