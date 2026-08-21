export type RemitoTipo = "entrega" | "retiro";

export function buildRemitoNumero(orderId: string, tipo: RemitoTipo) {
  const suffix = orderId.slice(-8).toUpperCase();
  return `REM-${suffix}-${tipo === "entrega" ? "E" : "R"}`;
}

export function remitoTitulo(tipo: RemitoTipo) {
  return tipo === "entrega" ? "Remito de Entrega" : "Remito de Retiro";
}

export function buildRemitoWhatsAppMessage(params: {
  tipo: RemitoTipo;
  contactoNombre: string;
  nombreEvento: string;
  remitoUrl: string;
}) {
  const { tipo, contactoNombre, nombreEvento, remitoUrl } = params;
  const accion = tipo === "entrega" ? "entrega" : "retiro";
  return (
    `¡Hola ${contactoNombre}! Te compartimos el remito de ${accion} de equipos de LOBYTE ` +
    `para "${nombreEvento}".\n\n` +
    `Podés verlo e imprimirlo/guardarlo como PDF acá:\n${remitoUrl}\n\n` +
    `Cualquier consulta nos escribís. ¡Gracias!`
  );
}
