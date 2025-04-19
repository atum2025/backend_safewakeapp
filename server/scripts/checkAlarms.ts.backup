import { db } from "../db";
import { alarmConfigs } from "../../shared/schema";
import { eq, lt } from "drizzle-orm";
import dayjs from "dayjs";
import axios from "axios";

async function checkAlarms() {
  const now = new Date(); // tipo Date correto

  console.log("⌛ Agora:", now.toISOString());

  const expiredAlarms = await db
    .select()
    .from(alarmConfigs)
    .where(lt(alarmConfigs.nextAlarm, now)); // alarmes com nextAlarm < agora

  console.log("🔍 Alarmes atrasados encontrados:", expiredAlarms.length);

  const allAlarms = await db.select({ id: alarmConfigs.id, userId: alarmConfigs.userId, nextAlarm: alarmConfigs.nextAlarm }).from(alarmConfigs);
  console.log("📦 Todos os alarmes existentes:");
  console.table(allAlarms);

  for (const alarm of expiredAlarms) {
    console.log(`⏰ Alarme do user ${alarm.userId} está atrasado!`);

    try {
      const response = await axios.post("http://localhost:3000/api/send-emergency", {
        userId: alarm.userId,
      });
      console.log(`📲 Mensagem enviada: ${response.data.message}`);
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem de emergência:", error.message);
    }

    // Agendar próximo alarme
    const newNextAlarm = dayjs(alarm.nextAlarm)
      .add(alarm.repeatInterval, "hour")
      .toISOString();

    await db
      .update(alarmConfigs)
      .set({ nextAlarm: new Date(newNextAlarm) })
      .where(eq(alarmConfigs.id, alarm.id));

    console.log(`🕐 Próximo alarme agendado para ${newNextAlarm}`);
  }
}

checkAlarms()
  .then(() => {
    console.log("🔁 Verificação concluída.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Erro ao verificar alarmes:", err);
    process.exit(1);
  });
