import type {
  EquipmentModel,
  DigitalServiceType,
  MaterialStatus,
  InvoiceType,
  PaymentMethod,
  OrderStatus,
} from "@prisma/client";

// -----------------------------------------------------------------------------
// Tipos compartidos entre el wizard (cliente) y los server actions (servidor)
// -----------------------------------------------------------------------------

export interface WizardItemInput {
  modelo: EquipmentModel;
  cantidad: number;
}

export interface WizardDigitalServiceInput {
  tipoServicio: DigitalServiceType;
  descripcionRequerimientos: string;
  estadoMaterial: MaterialStatus;
  notasMaterialFaltante: string;
  urlArchivosAdjuntos: string;
}

export interface WizardInsuranceInput {
  requiereSeguro: boolean;
  urlComprobanteSeguro: string;
  notas: string;
}

export interface WizardPaymentInput {
  precioTotal: number;
  tipoFactura: InvoiceType;
  condicionPago: PaymentMethod;
  montoSena: number;
  fechaSena: string;
  cuentaPagoSena: string;
  urlComprobanteSena: string;
  senaPagada: boolean;
  pagadoTotal: boolean;
}

export interface WizardPayload {
  clienteId: string;
  nombreEvento: string;
  ubicacionDireccion: string;
  ubicacionMapaUrl: string;
  fechaHoraEntrega: string; // ISO
  fechaHoraRetiro: string; // ISO
  estadoEvento: OrderStatus;
  items: WizardItemInput[];
  digitalServices: WizardDigitalServiceInput[];
  insurance: WizardInsuranceInput;
  payment: WizardPaymentInput;
}
