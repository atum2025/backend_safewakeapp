import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { alarmConfigs } from "../../shared/schema";
import fetch from "node-fetch";

const TOLERANCE_MINUTES = 3;

async function checkAndUpdateAlarms() {
  const now = new Date();
  const alarms = await db.select().from(alarmConfigs);

  for (const alarm of alarms) {
    const nextAlarm = new Date(alarm.nextAlarm);

    if (isNaN(nextAlarm.getTime())) {
      console.warn(`⚠️  nextAlarm inválido para o usuário ${alarm.userId}:`, alarm.nextAlarm);
      continue;
    }

    const limit = new Date(nextAlarm.getTime() + TOLERANCE_MINUTES * 60 * 1000);

    if (now > limit) {
      console.log(`🔁 Atualizando alarme do usuário ${alarm.userId}`);

      if (!alarm.repeatInterval || isNaN(alarm.repeatInterval)) {
        console.error(`⛔️ repeatInterval inválido para o usuário ${alarm.userId}:`, alarm.repeatInterval);
        continue;
      }

      const newNextAlarm = new Date(
        nextAlarm.getTime() + alarm.repeatInterval * 60 * 60 * 1000
      );

      await db
        .update(alarmConfigs)
        .set({ nextAlarm: newNextAlarm })
        .where(eq(alarmConfigs.id, alarm.id));

      // Dispara emergência real
      const res = await fetch("http://localhost:3000/api/send-emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: alarm.userId }),
      });

      const json = await res.json();
      console.log("🚨 Emergência enviada:", json);
    }
  }
}

// Execução principal
checkAndUpdateAlarms()
  .then(() => {
    console.log("✅ Verificação concluída.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Erro ao verificar alarmes:", err);
    process.exit(1);
  });


// Função de teste com dados mockados (chame manualmente se quiser)
async function sendEmergencyMock() {
  const res = await fetch("http://localhost:3000/api/send-emergency", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: 999, // ID fictício
      name: "Mãe da Cidoca ❤️",
      phoneNumber: "+5599999999999",
    }),
  });

  const json = await res.json();
  console.log("🚨 Emergência MOCK enviada:", json);
}

// Descomente abaixo se quiser testar o mock direto:
// sendEmergencyMock();
