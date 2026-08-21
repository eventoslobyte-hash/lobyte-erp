const GOOGLE_REVIEWS_URL =
  process.env.NEXT_PUBLIC_GOOGLE_REVIEWS_URL || "https://g.page/r/lobyte/review";

export function buildSurveyMessage(params: { contactoNombre: string; nombreEvento: string }) {
  const { contactoNombre, nombreEvento } = params;
  return (
    `¡Hola ${contactoNombre}! 👋 Somos el equipo de LOBYTE.\n\n` +
    `Queríamos agradecerte por confiar en nosotros para "${nombreEvento}". ` +
    `Nos encantaría conocer tu opinión sobre el servicio para seguir mejorando.\n\n` +
    `¿Nos dejarías una reseña rápida? Nos ayuda muchísimo 🙌\n` +
    `${GOOGLE_REVIEWS_URL}\n\n` +
    `¡Gracias por elegir LOBYTE!`
  );
}

export function buildWhatsAppLink(phone: string, message: string) {
  const cleanPhone = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function buildMailtoLink(email: string, params: { contactoNombre: string; nombreEvento: string }) {
  const subject = encodeURIComponent(`LOBYTE — ¿Cómo fue tu experiencia en ${params.nombreEvento}?`);
  const body = encodeURIComponent(buildSurveyMessage(params));
  return `mailto:${email}?subject=${subject}&body=${body}`;
}
