import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Room {
  id: string;
  name: string;
  type: string;
  description: string | null;
  created_at: string;
  memberCount?: number;
  messageCount?: number;
}

const AdminChat = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      const { data: roomsData } = await supabase
        .from("chat_rooms")
        .select("*")
        .order("created_at", { ascending: false });

      const enriched = await Promise.all(
        (roomsData ?? []).map(async (room) => {
          const [members, messages] = await Promise.all([
            supabase.from("chat_room_members").select("id", { count: "exact", head: true }).eq("room_id", room.id),
            supabase.from("chat_messages").select("id", { count: "exact", head: true }).eq("room_id", room.id),
          ]);
          return {
            ...room,
            memberCount: members.count ?? 0,
            messageCount: messages.count ?? 0,
          };
        })
      );

      setRooms(enriched);
      setLoading(false);
    };
    fetchRooms();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Chat Rooms</h1>
        <p className="text-muted-foreground text-sm mt-1">View and manage chat rooms</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">All Rooms ({rooms.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No chat rooms yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Members</TableHead>
                  <TableHead className="text-muted-foreground">Messages</TableHead>
                  <TableHead className="text-muted-foreground">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((r) => (
                  <TableRow key={r.id} className="border-border">
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-foreground">{r.name}</p>
                        {r.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{r.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs capitalize">{r.type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{r.memberCount}</TableCell>
                    <TableCell className="text-sm text-foreground">{r.messageCount}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(r.created_at), "MMM d, yyyy")}
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

export default AdminChat;
