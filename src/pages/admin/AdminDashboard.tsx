import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertTriangle, MessageSquare, Shield } from "lucide-react";

interface Stats {
  users: number;
  alerts: number;
  rooms: number;
  messages: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({ users: 0, alerts: 0, rooms: 0, messages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [profiles, alerts, rooms, messages] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("community_alerts").select("id", { count: "exact", head: true }),
        supabase.from("chat_rooms").select("id", { count: "exact", head: true }),
        supabase.from("chat_messages").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        users: profiles.count ?? 0,
        alerts: alerts.count ?? 0,
        rooms: rooms.count ?? 0,
        messages: messages.count ?? 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Users", value: stats.users, icon: Users, color: "text-primary" },
    { label: "Active Alerts", value: stats.alerts, icon: AlertTriangle, color: "text-warning" },
    { label: "Chat Rooms", value: stats.rooms, icon: MessageSquare, color: "text-accent" },
    { label: "Messages", value: stats.messages, icon: Shield, color: "text-safe" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              ) : (
                <p className="text-3xl font-display font-bold text-foreground">{c.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
