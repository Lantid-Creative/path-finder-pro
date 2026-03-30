import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Alert {
  id: string;
  type: string;
  message: string;
  description: string | null;
  location_name: string | null;
  is_active: boolean;
  created_at: string;
  user_id: string;
}

const AdminAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    const { data } = await supabase
      .from("community_alerts")
      .select("*")
      .order("created_at", { ascending: false });
    setAlerts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, []);

  const toggleAlert = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("community_alerts")
      .update({ is_active: !isActive })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update alert");
    } else {
      toast.success(isActive ? "Alert deactivated" : "Alert activated");
      fetchAlerts();
    }
  };

  const deleteAlert = async (id: string) => {
    const { error } = await supabase.from("community_alerts").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete alert");
    } else {
      toast.success("Alert deleted");
      fetchAlerts();
    }
  };

  const typeBadgeVariant = (type: string) => {
    switch (type) {
      case "danger": return "destructive" as const;
      case "warning": return "secondary" as const;
      default: return "outline" as const;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Community Alerts</h1>
        <p className="text-muted-foreground text-sm mt-1">Moderate and manage community alerts</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">All Alerts ({alerts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No alerts yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Message</TableHead>
                  <TableHead className="text-muted-foreground">Location</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((a) => (
                  <TableRow key={a.id} className="border-border">
                    <TableCell>
                      <Badge variant={typeBadgeVariant(a.type)} className="text-xs capitalize">{a.type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-foreground max-w-[200px] truncate">{a.message}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.location_name ?? "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={a.is_active ? "default" : "outline"}
                        className="text-xs cursor-pointer"
                        onClick={() => toggleAlert(a.id, a.is_active)}
                      >
                        {a.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(a.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => deleteAlert(a.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAlerts;
