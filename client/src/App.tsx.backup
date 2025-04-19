// App.tsx (React Web)
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    const userId = 1;
    const now = new Date();
    const nextAlarm = new Date(now.getTime() + 10 * 1000);
    const tolerance = 3 * 60 * 1000;

    console.log("⏰ Alarme agendado para:", nextAlarm.toISOString());

    const interval = setInterval(() => {
      const current = new Date();
      const limit = new Date(nextAlarm.getTime() + tolerance);

      console.log("⌛ Agora:", current.toISOString());
      console.log("⏳ Tolerância até:", limit.toISOString());

      if (current > limit) {
        console.log("🚨 Enviando emergência...");

        fetch("http://localhost:3000/api/send-emergency", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId })
        })
          .then(res => res.json())
          .then(data => console.log("✅ Emergência enviada:", data))
          .catch(err => console.error("❌ Erro ao enviar emergência:", err));

        clearInterval(interval);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return <h1>SafeWake Web Teste ⏰</h1>;
}
