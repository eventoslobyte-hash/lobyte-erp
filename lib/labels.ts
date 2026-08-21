import type {
  EquipmentModel,
  EquipmentStatus,
  OrderStatus,
  DigitalServiceType,
  MaterialStatus,
  InsuranceStatus,
  InvoiceType,
  PaymentMethod,
  OrigenCliente,
} from "@prisma/client";

// -----------------------------------------------------------------------------
// Etiquetas en español + variantes de color para cada enum del sistema.
// Centralizado acá para que toda la UI use la misma fuente de verdad.
// -----------------------------------------------------------------------------

export const equipmentModelLabels: Record<EquipmentModel, string> = {
  TOTEM_27_AUTOSERVICIO: 'Tótem 27" Autoservicio',
  TOTEM_TACTIL_PCAP: "Tótem Táctil PCAP",
  TOTEM_TACTIL_IR: "Tótem Táctil IR",
  TV_SMART: "TV / Smart Screen",
  PLACA_INTERACTIVA: "Placa Interactiva",
  KIOSCO_DOBLE_PANTALLA: "Kiosco Doble Pantalla",
  OTRO: "Otro",
};

export const equipmentStatusLabels: Record<EquipmentStatus, string> = {
  DISPONIBLE: "Disponible",
  EN_EVENTO: "En Evento",
  MANTENIMIENTO: "Mantenimiento",
  BAJA: "Baja",
};

export const equipmentStatusColors: Record<EquipmentStatus, string> = {
  DISPONIBLE: "success",
  EN_EVENTO: "brand",
  MANTENIMIENTO: "warning",
  BAJA: "muted",
};

export const orderStatusLabels: Record<OrderStatus, string> = {
  PRESUPUESTADO: "Presupuestado",
  EN_COTIZACION: "En Cotización",
  CONFIRMADO: "Confirmado",
  EN_CURSO: "En Curso",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
};

export const orderStatusColors: Record<OrderStatus, string> = {
  PRESUPUESTADO: "muted",
  EN_COTIZACION: "warning",
  CONFIRMADO: "brand",
  EN_CURSO: "success",
  FINALIZADO: "muted",
  CANCELADO: "destructive",
};

export const digitalServiceTypeLabels: Record<DigitalServiceType, string> = {
  DESARROLLO_WEB: "Desarrollo Web",
  JUEGOS: "Juegos Interactivos",
  PLACAS: "Placas / Gráfica",
  VIDEOS: "Videos",
  EDICION: "Edición",
  ALQUILER_PURO: "Alquiler Puro (sin desarrollo)",
};

export const materialStatusLabels: Record<MaterialStatus, string> = {
  NO_NECESARIO: "No Necesario",
  PENDIENTE: "Pendiente",
  INCOMPLETO: "Incompleto",
  COMPLETO: "Completo",
};

export const materialStatusColors: Record<MaterialStatus, string> = {
  NO_NECESARIO: "muted",
  PENDIENTE: "warning",
  INCOMPLETO: "warning",
  COMPLETO: "success",
};

export const insuranceStatusLabels: Record<InsuranceStatus, string> = {
  PENDIENTE: "Pendiente",
  PRESENTADO: "Presentado",
  NO_REQUERIDO: "No Requerido",
};

export const insuranceStatusColors: Record<InsuranceStatus, string> = {
  PENDIENTE: "destructive",
  PRESENTADO: "success",
  NO_REQUERIDO: "muted",
};

export const invoiceTypeLabels: Record<InvoiceType, string> = {
  FACTURA_A: "Factura A",
  FACTURA_C: "Factura C",
  SIN_FACTURA: "Sin Factura",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  CRYPTO: "Crypto",
  TARJETA: "Tarjeta",
  OTRO: "Otro",
};

export const origenClienteLabels: Record<OrigenCliente, string> = {
  INSTAGRAM: "Instagram",
  REFERIDO: "Referido",
  GOOGLE: "Google",
  EXPO_FERIA: "Expo / Feria",
  WEB: "Sitio Web",
  OTRO: "Otro",
};
