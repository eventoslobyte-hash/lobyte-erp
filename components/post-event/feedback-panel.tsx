"use client";

import { useFormStatus } from "react-dom";
import { MessageCircle, Mail, Star } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RatingStarsInput } from "@/components/clients/rating-stars";
import { buildSurveyMessage, buildWhatsAppLink, buildMailtoLink } from "@/lib/post-event-templates";
import type { PostEvent } from "@prisma/client";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Guardando..." : "Guardar encuesta"}
    </Button>
  );
}

export function FeedbackPanel({
  postEvent,
  contactoNombre,
  nombreEvento,
  telefono,
  email,
  action,
}: {
  postEvent: PostEvent;
  contactoNombre: string;
  nombreEvento: string;
  telefono: string;
  email: string | null;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const message = buildSurveyMessage({ contactoNombre, nombreEvento });
  const whatsappLink = buildWhatsAppLink(telefono, message);
  const mailtoLink = email ? buildMailtoLink(email, { contactoNombre, nombreEvento }) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-4 w-4" />
          Post-Evento / Feedback
        </CardTitle>
        <CardDescription>
          Enviá la encuesta de satisfacción con el link de reseñas de Google, y registrá la respuesta del cliente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" />
              Enviar por WhatsApp
            </a>
          </Button>
          {mailtoLink && (
            <Button asChild variant="outline">
              <a href={mailtoLink}>
                <Mail className="h-4 w-4" />
                Enviar por Email
              </a>
            </Button>
          )}
        </div>

        <form action={action} className="space-y-4 border-t border-border pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                name="linkResenaEnviado"
                defaultChecked={postEvent.linkResenaEnviado}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              Reseña enviada
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                name="encuestado"
                defaultChecked={postEvent.encuestado}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              Cliente encuestado
            </label>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Calificación de Satisfacción</Label>
            <RatingStarsInput name="calificacionSatisfaccion" defaultValue={postEvent.calificacionSatisfaccion ?? 0} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Comentarios del Cliente</Label>
            <Textarea name="comentariosCliente" rows={3} defaultValue={postEvent.comentariosCliente ?? ""} />
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
