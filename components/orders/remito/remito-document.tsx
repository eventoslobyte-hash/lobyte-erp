import { equipmentModelLabels } from "@/lib/labels";
import { buildRemitoNumero, remitoTitulo, type RemitoTipo } from "@/lib/remito";
import { formatDate } from "@/lib/utils";
import type { Client, Order, OrderItem } from "@prisma/client";

type RemitoOrder = Order & { cliente: Client; items: OrderItem[] };

export function RemitoDocument({ order, tipo }: { order: RemitoOrder; tipo: RemitoTipo }) {
  const numero = buildRemitoNumero(order.id, tipo);
  const titulo = remitoTitulo(tipo);
  const fechaMovimiento = tipo === "entrega" ? order.fechaHoraEntrega : order.fechaHoraRetiro;
  const hoy = new Date();

  return (
    <div className="remito-print mx-auto max-w-3xl bg-white p-8 text-slate-900 print:p-0">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4 border-b-2 border-slate-900 pb-4">
        <div>
          <p className="text-xl font-extrabold tracking-tight">LOBYTE</p>
          <p className="text-xs text-slate-500">
            Alquiler de tótems y servicios digitales para eventos
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold uppercase tracking-wide">{titulo}</p>
          <p className="text-sm text-slate-600">N° {numero}</p>
          <p className="text-xs text-slate-500">Emitido el {formatDate(hoy, true)}</p>
        </div>
      </div>

      {/* Cliente y evento */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-slate-300 p-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Cliente
          </p>
          <p className="text-sm font-medium">{order.cliente.razonSocial}</p>
          {order.cliente.cuitCuil && <p className="text-xs text-slate-600">CUIT/CUIL: {order.cliente.cuitCuil}</p>}
          <p className="text-xs text-slate-600">Contacto: {order.cliente.contactoNombre}</p>
          <p className="text-xs text-slate-600">Tel: {order.cliente.telefono}</p>
        </div>

        <div className="rounded-md border border-slate-300 p-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Evento
          </p>
          <p className="text-sm font-medium">{order.nombreEvento}</p>
          <p className="text-xs text-slate-600">{order.ubicacionDireccion}</p>
          <p className="text-xs text-slate-600">
            {tipo === "entrega" ? "Fecha/hora de entrega" : "Fecha/hora de retiro"}: {formatDate(fechaMovimiento, true)}
          </p>
        </div>
      </div>

      {/* Equipos */}
      <div className="mt-5">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Equipos {tipo === "entrega" ? "entregados" : "retirados"}
        </p>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-slate-900">
              <th className="py-1.5 text-left font-semibold">Modelo</th>
              <th className="py-1.5 text-right font-semibold">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-slate-200">
                <td className="py-1.5">{equipmentModelLabels[item.equipmentModel]}</td>
                <td className="py-1.5 text-right">{item.cantidad}</td>
              </tr>
            ))}
            {order.items.length === 0 && (
              <tr>
                <td colSpan={2} className="py-3 text-center text-xs text-slate-400">
                  Sin equipos cargados en este alquiler.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Observaciones */}
      <div className="mt-5">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Observaciones
        </p>
        <div className="h-16 rounded-md border border-slate-300 p-2 text-xs text-slate-400">
          &nbsp;
        </div>
      </div>

      {/* Firmas */}
      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <SignatureBlock label="Entrega — LOBYTE" />
        <SignatureBlock
          label={tipo === "entrega" ? "Recibí conforme — Cliente" : "Entrego conforme — Cliente"}
        />
      </div>

      <p className="mt-8 text-center text-[10px] text-slate-400">
        Documento generado por LOBYTE ERP · Alquiler #{order.id.slice(-8).toUpperCase()} · {formatDate(hoy, true)}
      </p>
    </div>
  );
}

function SignatureBlock({ label }: { label: string }) {
  return (
    <div>
      <div className="h-16 border-b border-slate-400" />
      <p className="mt-1 text-xs font-medium text-slate-700">{label}</p>
      <div className="mt-3 space-y-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-20 shrink-0">Aclaración:</span>
          <span className="flex-1 border-b border-dotted border-slate-300">&nbsp;</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-20 shrink-0">DNI:</span>
          <span className="flex-1 border-b border-dotted border-slate-300">&nbsp;</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-20 shrink-0">Fecha:</span>
          <span className="flex-1 border-b border-dotted border-slate-300">&nbsp;</span>
        </div>
      </div>
    </div>
  );
}
