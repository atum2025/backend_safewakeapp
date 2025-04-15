import axios from 'axios';

// SIMULAÇÃO DO ALARME
const userId = 1;
const now = new Date();
const nextAlarm = new Date(now.getTime() + 10 * 1000); // 10 segundos no futuro
const tolerance = 3 * 60 * 1000; // 3 minutos de tolerância

console.log("⏰ Alarme agendado para:", nextAlarm.toISOString());

const interval = setInterval(() => {
  const current = new Date();
  const limit = new Date(nextAlarm.getTime() + tolerance);

  console.log("⌛ Agora:", current.toISOString());
  console.log("⏳ Tolerância até:", limit.toISOString());

  if (current > limit) {
    console.log("🚨 Alarme não foi desligado! Enviando emergência...");

    axios.post("http://localhost:3000/api/send-emergency", {
      userId: userId
    }).then(res => {
      console.log("✅ Emergência enviada:", res.data);
    }).catch(err => {
      console.error("❌ Erro ao enviar emergência:", err);
    });

    clearInterval(interval); // para o loop
  }
}, 10000); // checa a cada 10 segundos
