import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, MailOpen, Trash2, Clock } from "lucide-react";
import { apiJson, apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminMessages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<ContactMessage[]>({
    queryKey: ["admin-contact-messages"],
    queryFn: () => apiJson<ContactMessage[]>("/api/admin/contact-messages"),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/admin/contact-messages/${id}/read`, { method: "PUT" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-contact-messages"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/admin/contact-messages/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contact-messages"] });
      toast({ title: "Message deleted" });
    },
  });

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Contact Messages</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}` : "All messages read"}
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading messages...</p>
      ) : messages.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Mail className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No messages yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <Card
              key={msg.id}
              className={`transition-all ${!msg.isRead ? "border-primary/30 bg-primary/5" : ""}`}
              data-testid={`card-message-${msg.id}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {!msg.isRead ? (
                        <Mail className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <MailOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <h3 className={`font-semibold truncate ${!msg.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                        {msg.subject}
                      </h3>
                      {!msg.isRead && <Badge variant="default" className="text-xs shrink-0">New</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <span className="font-medium">{msg.name}</span>
                      <span>&middot;</span>
                      <a href={`mailto:${msg.email}`} className="hover:text-primary transition-colors">{msg.email}</a>
                      <span>&middot;</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(msg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{msg.message}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!msg.isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markReadMutation.mutate(msg.id)}
                        data-testid={`button-mark-read-${msg.id}`}
                      >
                        Mark Read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(msg.id)}
                      data-testid={`button-delete-message-${msg.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
