import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Eye } from "lucide-react";

const VisitorCounter = () => {
  const [count, setCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("xcel-visitor-count");
    const storedToday = localStorage.getItem("xcel-visitor-today");
    const storedDate = localStorage.getItem("xcel-visitor-date");
    const today = new Date().toDateString();

    let total = stored ? parseInt(stored, 10) : 4827;
    let daily = storedDate === today && storedToday ? parseInt(storedToday, 10) : Math.floor(Math.random() * 30) + 15;

    const visited = sessionStorage.getItem("xcel-visited");
    if (!visited) {
      total += 1;
      daily += 1;
      sessionStorage.setItem("xcel-visited", "true");
    }

    localStorage.setItem("xcel-visitor-count", String(total));
    localStorage.setItem("xcel-visitor-today", String(daily));
    localStorage.setItem("xcel-visitor-date", today);

    let current = 0;
    const step = Math.ceil(total / 60);
    const timer = setInterval(() => {
      current += step;
      if (current >= total) {
        current = total;
        clearInterval(timer);
      }
      setCount(current);
    }, 16);

    setTodayCount(daily);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-12"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-6">
          <div className="neu-card rounded-2xl px-8 py-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full skeu-badge flex items-center justify-center">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-foreground">{count.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground font-medium">Total Visitors</p>
            </div>
          </div>

          <div className="neu-card rounded-2xl px-8 py-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full skeu-badge flex items-center justify-center">
              <Eye className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-foreground">{todayCount}</p>
              <p className="text-sm text-muted-foreground font-medium">Visitors Today</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VisitorCounter;
