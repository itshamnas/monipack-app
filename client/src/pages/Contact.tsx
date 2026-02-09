import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    const mailtoBody = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const mailtoLink = `mailto:info@monipack.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailtoBody)}`;
    window.location.href = mailtoLink;

    toast({ title: "Opening your email client...", description: "Your message will be sent to info@monipack.com" });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Have questions about our products? We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="font-heading text-2xl font-semibold mb-6">Get in Touch</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="Your name" required data-testid="input-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="your@email.com" required data-testid="input-email" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" placeholder="How can we help?" required data-testid="input-subject" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" placeholder="Tell us more about your requirements..." rows={5} required data-testid="input-message" />
            </div>
            <Button type="submit" disabled={sending} className="w-full sm:w-auto" data-testid="button-submit">
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>

        <div className="space-y-6">
          <h2 className="font-heading text-2xl font-semibold mb-6">Contact Information</h2>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Head Office</p>
                  <p className="text-muted-foreground">Bin Hayl-1, Al Maardih St, Ghala, Muscat, Floor 5, Room No. 53, 130</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Phone</p>
                  <a href="tel:+96879062219" className="text-muted-foreground hover:text-primary transition-colors">+968 7906 2219</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Email</p>
                  <a href="mailto:info@monipack.com" className="text-muted-foreground hover:text-primary transition-colors">info@monipack.com</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Working Hours</p>
                  <p className="text-muted-foreground">8:00 AM – 2:00 PM &amp; 3:00 PM – 7:00 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-heading font-semibold mb-3">WhatsApp Inquiry</h3>
              <p className="text-muted-foreground mb-4">Prefer WhatsApp? Send us a message directly for quick responses.</p>
              <Button asChild variant="outline" className="w-full" data-testid="button-whatsapp">
                <a href="https://api.whatsapp.com/send?phone=96879062219" target="_blank" rel="noopener noreferrer">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Chat on WhatsApp
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
