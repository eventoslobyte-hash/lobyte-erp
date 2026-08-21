import { PrismaClient, EquipmentModel } from "@prisma/client";

const prisma = new PrismaClient();

function daysFromNow(days: number, hour = 9, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  console.log("🌱 Limpiando datos existentes...");
  await prisma.postEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.insurance.deleteMany();
  await prisma.digitalService.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.client.deleteMany();

  console.log("📦 Creando inventario de equipos...");
  const inventoryPlan: { modelo: EquipmentModel; count: number }[] = [
    { modelo: "TOTEM_27_AUTOSERVICIO", count: 10 },
    { modelo: "TOTEM_TACTIL_PCAP", count: 8 },
    { modelo: "TOTEM_TACTIL_IR", count: 6 },
    { modelo: "TV_SMART", count: 12 },
    { modelo: "PLACA_INTERACTIVA", count: 5 },
    { modelo: "KIOSCO_DOBLE_PANTALLA", count: 3 },
  ];

  const prefixMap: Record<string, string> = {
    TOTEM_27_AUTOSERVICIO: "T27",
    TOTEM_TACTIL_PCAP: "TPC",
    TOTEM_TACTIL_IR: "TIR",
    TV_SMART: "TVS",
    PLACA_INTERACTIVA: "PLA",
    KIOSCO_DOBLE_PANTALLA: "KDP",
  };

  for (const { modelo, count } of inventoryPlan) {
    for (let i = 1; i <= count; i++) {
      const codigo = `${prefixMap[modelo]}-${String(i).padStart(3, "0")}`;
      const estado = i === count ? "MANTENIMIENTO" : "DISPONIBLE";
      await prisma.equipment.create({
        data: {
          codigoInterno: codigo,
          modelo,
          estado,
          descripcion: `${codigo} — unidad de stock`,
          especificacionesTecnicas:
            modelo === "TOTEM_27_AUTOSERVICIO"
              ? 'Pantalla 27" Full HD, lector QR, impresora térmica opcional, Windows 11 IoT'
              : modelo === "TOTEM_TACTIL_PCAP"
              ? 'Pantalla táctil PCAP 43", multitouch 10 puntos, Android/Windows'
              : modelo === "TOTEM_TACTIL_IR"
              ? 'Pantalla táctil infrarroja 43", uso intensivo exterior'
              : modelo === "TV_SMART"
              ? 'Smart TV 55" 4K, soporte de piso incluido'
              : modelo === "PLACA_INTERACTIVA"
              ? "Placa interactiva a medida, sensores de proximidad"
              : "Kiosco doble pantalla espalda-espalda, ideal ferias",
        },
      });
    }
  }

  console.log("👥 Creando clientes...");
  const [clienteExpoTech, clienteBanco, clienteRetail, clienteUni, clienteStartup, clienteEventos] =
    await Promise.all([
      prisma.client.create({
        data: {
          razonSocial: "ExpoTech Argentina S.A.",
          cuitCuil: "30-71234567-8",
          contactoNombre: "Marina López",
          contactoCargo: "Coordinadora de Eventos",
          telefono: "+5491122334455",
          email: "marina.lopez@expotech.com.ar",
          comportamientoNotas: "Cliente frecuente, siempre paga en término. Prefiere coordinar por WhatsApp.",
          internalRating: 5,
          origenCliente: "REFERIDO",
          proximaExpo: "Expo Industrial 2026",
          fechaProximaExpo: daysFromNow(60),
        },
      }),
      prisma.client.create({
        data: {
          razonSocial: "Banco Nación Digital",
          cuitCuil: "30-50000000-1",
          contactoNombre: "Carlos Fernández",
          contactoCargo: "Gerente de Marketing",
          telefono: "+5491133445566",
          email: "cfernandez@bancodigital.com.ar",
          comportamientoNotas: "Requiere factura A siempre. Proceso de aprobación interno lento, avisar con anticipación.",
          internalRating: 4,
          origenCliente: "GOOGLE",
        },
      }),
      prisma.client.create({
        data: {
          razonSocial: "Retail Group SRL",
          cuitCuil: "30-65432109-2",
          contactoNombre: "Julieta Gómez",
          contactoCargo: "Trade Marketing",
          telefono: "+5491144556677",
          email: "jgomez@retailgroup.com",
          comportamientoNotas: "A veces se atrasa con el envío de material gráfico. Hacer seguimiento proactivo.",
          internalRating: 3,
          origenCliente: "INSTAGRAM",
        },
      }),
      prisma.client.create({
        data: {
          razonSocial: "Universidad Tecnológica del Sur",
          cuitCuil: "30-98765432-0",
          contactoNombre: "Prof. Ricardo Paz",
          contactoCargo: "Director de Extensión",
          telefono: "+5491155667788",
          email: "rpaz@uts.edu.ar",
          comportamientoNotas: "Institución pública, pagos por transferencia con orden de compra.",
          internalRating: 4,
          origenCliente: "WEB",
          proximaExpo: "Feria de Carreras UTS",
          fechaProximaExpo: daysFromNow(120),
        },
      }),
      prisma.client.create({
        data: {
          razonSocial: "Startup Fintech Nubi",
          cuitCuil: "30-71199887-6",
          contactoNombre: "Agustina Ríos",
          contactoCargo: "Head of Growth",
          telefono: "+5491166778899",
          email: "agustina@nubi.io",
          comportamientoNotas: "Cliente nuevo, muy activo en redes. Buen potencial de recompra.",
          internalRating: 4,
          origenCliente: "EXPO_FERIA",
        },
      }),
      prisma.client.create({
        data: {
          razonSocial: "Producciones Eventos del Plata",
          cuitCuil: "30-70011223-4",
          contactoNombre: "Nicolás Suárez",
          contactoCargo: "Productor General",
          telefono: "+5491177889900",
          email: "nico@eventosdelplata.com",
          comportamientoNotas: "Productora tercerizada, subcontrata para varios clientes finales. Buen pagador pero apurado con tiempos.",
          internalRating: 5,
          origenCliente: "REFERIDO",
        },
      }),
    ]);

  console.log("📅 Creando alquileres / eventos...");

  // 1) Entrega en menos de 48hs, con seguro pendiente y material incompleto -> dispara alertas
  const order1 = await prisma.order.create({
    data: {
      clienteId: clienteExpoTech.id,
      nombreEvento: "Lanzamiento Producto ExpoTech 2026",
      ubicacionDireccion: "Costa Salguero, Av. Costanera Rafael Obligado, CABA",
      ubicacionMapaUrl: "https://maps.google.com/?q=Costa+Salguero+CABA",
      fechaHoraEntrega: daysFromNow(1, 8, 0),
      fechaHoraRetiro: daysFromNow(3, 18, 0),
      cantidadDias: 2,
      estadoEvento: "CONFIRMADO",
      items: {
        create: [
          { equipmentModel: "TOTEM_27_AUTOSERVICIO", cantidad: 3 },
          { equipmentModel: "TV_SMART", cantidad: 2 },
        ],
      },
      digitalServices: {
        create: [
          {
            tipoServicio: "DESARROLLO_WEB",
            descripcionRequerimientos: "Landing interactiva de registro de asistentes con QR",
            estadoMaterial: "INCOMPLETO",
            notasMaterialFaltante: "Falta logo en alta resolución y paleta de colores oficial",
          },
        ],
      },
      insurance: {
        create: { requiereSeguro: true, estado: "PENDIENTE", notas: "Solicitado, cliente dijo que lo envía hoy" },
      },
      payment: {
        create: {
          precioTotal: 850000,
          tipoFactura: "FACTURA_A",
          condicionPago: "TRANSFERENCIA",
          montoSena: 300000,
          fechaSena: daysFromNow(-10),
          cuentaPagoSena: "CBU LOBYTE - Banco Galicia",
          senaPagada: true,
          pagadoTotal: false,
        },
      },
    },
  });

  // 2) Entrega en menos de 48hs, todo en orden
  const order2 = await prisma.order.create({
    data: {
      clienteId: clienteBanco.id,
      nombreEvento: "Activación Sucursal Banco Nación",
      ubicacionDireccion: "Sarmiento 1500, CABA",
      fechaHoraEntrega: daysFromNow(2, 9, 0),
      fechaHoraRetiro: daysFromNow(2, 20, 0),
      cantidadDias: 1,
      estadoEvento: "CONFIRMADO",
      items: { create: [{ equipmentModel: "TOTEM_TACTIL_PCAP", cantidad: 2 }] },
      digitalServices: {
        create: [
          {
            tipoServicio: "ALQUILER_PURO",
            estadoMaterial: "NO_NECESARIO",
          },
        ],
      },
      insurance: { create: { requiereSeguro: true, estado: "PRESENTADO", urlComprobanteSeguro: "https://drive.google.com/comprobante-seguro-2" } },
      payment: {
        create: {
          precioTotal: 420000,
          tipoFactura: "FACTURA_A",
          condicionPago: "TRANSFERENCIA",
          montoSena: 420000,
          fechaSena: daysFromNow(-5),
          senaPagada: true,
          pagadoTotal: true,
        },
      },
    },
  });

  // 3) Próxima semana, saldo pendiente
  const order3 = await prisma.order.create({
    data: {
      clienteId: clienteRetail.id,
      nombreEvento: "Activación Shopping Retail Group",
      ubicacionDireccion: "Av. Cabildo 2450, CABA",
      fechaHoraEntrega: daysFromNow(6, 10, 0),
      fechaHoraRetiro: daysFromNow(9, 21, 0),
      cantidadDias: 3,
      estadoEvento: "CONFIRMADO",
      items: {
        create: [
          { equipmentModel: "TOTEM_27_AUTOSERVICIO", cantidad: 2 },
          { equipmentModel: "KIOSCO_DOBLE_PANTALLA", cantidad: 1 },
        ],
      },
      digitalServices: {
        create: [
          {
            tipoServicio: "JUEGOS",
            descripcionRequerimientos: "Juego de ruleta de premios para captar leads",
            estadoMaterial: "PENDIENTE",
            notasMaterialFaltante: "Esperando bases y condiciones legales del sorteo",
          },
        ],
      },
      insurance: { create: { requiereSeguro: false, estado: "NO_REQUERIDO" } },
      payment: {
        create: {
          precioTotal: 690000,
          tipoFactura: "FACTURA_C",
          condicionPago: "EFECTIVO",
          montoSena: 200000,
          fechaSena: daysFromNow(-3),
          senaPagada: true,
          pagadoTotal: false,
        },
      },
    },
  });

  // 4) En cotización (presupuesto en danza)
  const order4 = await prisma.order.create({
    data: {
      clienteId: clienteStartup.id,
      nombreEvento: "Demo Day Nubi Fintech",
      ubicacionDireccion: "Distrito Tecnológico, Parque Patricios, CABA",
      fechaHoraEntrega: daysFromNow(15, 8, 0),
      fechaHoraRetiro: daysFromNow(15, 22, 0),
      cantidadDias: 1,
      estadoEvento: "EN_COTIZACION",
      items: { create: [{ equipmentModel: "TOTEM_TACTIL_IR", cantidad: 4 }] },
      digitalServices: {
        create: [
          {
            tipoServicio: "PLACAS",
            descripcionRequerimientos: "Placas de bienvenida y agenda del evento",
            estadoMaterial: "PENDIENTE",
          },
        ],
      },
      insurance: { create: { requiereSeguro: false, estado: "PENDIENTE" } },
      payment: {
        create: {
          precioTotal: 380000,
          tipoFactura: "SIN_FACTURA",
          condicionPago: "CRYPTO",
          montoSena: 0,
          senaPagada: false,
          pagadoTotal: false,
        },
      },
    },
  });

  // 5) Universidad, a futuro, presupuestado
  const order5 = await prisma.order.create({
    data: {
      clienteId: clienteUni.id,
      nombreEvento: "Feria de Carreras UTS 2026",
      ubicacionDireccion: "Campus UTS, Av. San Martín 4500",
      fechaHoraEntrega: daysFromNow(45, 7, 0),
      fechaHoraRetiro: daysFromNow(47, 20, 0),
      cantidadDias: 2,
      estadoEvento: "PRESUPUESTADO",
      items: {
        create: [
          { equipmentModel: "TOTEM_27_AUTOSERVICIO", cantidad: 5 },
          { equipmentModel: "TV_SMART", cantidad: 4 },
        ],
      },
      digitalServices: {
        create: [
          {
            tipoServicio: "DESARROLLO_WEB",
            descripcionRequerimientos: "Buscador interactivo de carreras y aranceles",
            estadoMaterial: "NO_NECESARIO",
          },
        ],
      },
      insurance: { create: { requiereSeguro: true, estado: "PENDIENTE" } },
      payment: {
        create: {
          precioTotal: 1250000,
          tipoFactura: "FACTURA_A",
          condicionPago: "TRANSFERENCIA",
          montoSena: 0,
          senaPagada: false,
          pagadoTotal: false,
        },
      },
    },
  });

  // 6) En curso ahora mismo
  const order6 = await prisma.order.create({
    data: {
      clienteId: clienteEventos.id,
      nombreEvento: "Congreso Anual de Medicina",
      ubicacionDireccion: "Centro de Convenciones, La Rural, CABA",
      fechaHoraEntrega: daysFromNow(-1, 8, 0),
      fechaHoraRetiro: daysFromNow(1, 20, 0),
      cantidadDias: 2,
      estadoEvento: "EN_CURSO",
      items: { create: [{ equipmentModel: "TOTEM_TACTIL_PCAP", cantidad: 3 }] },
      digitalServices: { create: [{ tipoServicio: "ALQUILER_PURO", estadoMaterial: "NO_NECESARIO" }] },
      insurance: { create: { requiereSeguro: true, estado: "PRESENTADO", urlComprobanteSeguro: "https://drive.google.com/comprobante-seguro-6" } },
      payment: {
        create: {
          precioTotal: 540000,
          tipoFactura: "FACTURA_A",
          condicionPago: "TRANSFERENCIA",
          montoSena: 540000,
          senaPagada: true,
          pagadoTotal: true,
        },
      },
    },
  });

  // 7-9) Finalizados (historial + post-evento)
  const order7 = await prisma.order.create({
    data: {
      clienteId: clienteExpoTech.id,
      nombreEvento: "Feria del Emprendedor 2025",
      ubicacionDireccion: "La Rural, CABA",
      fechaHoraEntrega: daysFromNow(-40, 9, 0),
      fechaHoraRetiro: daysFromNow(-38, 19, 0),
      cantidadDias: 3,
      estadoEvento: "FINALIZADO",
      items: { create: [{ equipmentModel: "TOTEM_27_AUTOSERVICIO", cantidad: 4 }] },
      digitalServices: { create: [{ tipoServicio: "JUEGOS", estadoMaterial: "COMPLETO" }] },
      insurance: { create: { requiereSeguro: true, estado: "PRESENTADO", urlComprobanteSeguro: "https://drive.google.com/comp-7" } },
      payment: {
        create: {
          precioTotal: 980000,
          tipoFactura: "FACTURA_A",
          condicionPago: "TRANSFERENCIA",
          montoSena: 980000,
          senaPagada: true,
          pagadoTotal: true,
        },
      },
      postEvent: {
        create: {
          linkResenaEnviado: true,
          encuestado: true,
          calificacionSatisfaccion: 5,
          comentariosCliente: "Excelente servicio, muy profesionales y puntuales.",
        },
      },
    },
  });

  const order8 = await prisma.order.create({
    data: {
      clienteId: clienteRetail.id,
      nombreEvento: "Black Friday Retail Group",
      ubicacionDireccion: "Sucursal Palermo",
      fechaHoraEntrega: daysFromNow(-20, 9, 0),
      fechaHoraRetiro: daysFromNow(-18, 21, 0),
      cantidadDias: 2,
      estadoEvento: "FINALIZADO",
      items: { create: [{ equipmentModel: "TV_SMART", cantidad: 6 }] },
      digitalServices: { create: [{ tipoServicio: "VIDEOS", estadoMaterial: "COMPLETO" }] },
      insurance: { create: { requiereSeguro: false, estado: "NO_REQUERIDO" } },
      payment: {
        create: {
          precioTotal: 610000,
          tipoFactura: "FACTURA_C",
          condicionPago: "EFECTIVO",
          montoSena: 610000,
          senaPagada: true,
          pagadoTotal: true,
        },
      },
      postEvent: {
        create: {
          linkResenaEnviado: true,
          encuestado: false,
        },
      },
    },
  });

  const order9 = await prisma.order.create({
    data: {
      clienteId: clienteUni.id,
      nombreEvento: "Jornada de Puertas Abiertas UTS",
      ubicacionDireccion: "Campus UTS",
      fechaHoraEntrega: daysFromNow(-70, 9, 0),
      fechaHoraRetiro: daysFromNow(-69, 18, 0),
      cantidadDias: 1,
      estadoEvento: "FINALIZADO",
      items: { create: [{ equipmentModel: "TOTEM_TACTIL_IR", cantidad: 2 }] },
      digitalServices: { create: [{ tipoServicio: "EDICION", estadoMaterial: "COMPLETO" }] },
      insurance: { create: { requiereSeguro: false, estado: "NO_REQUERIDO" } },
      payment: {
        create: {
          precioTotal: 310000,
          tipoFactura: "SIN_FACTURA",
          condicionPago: "TRANSFERENCIA",
          montoSena: 310000,
          senaPagada: true,
          pagadoTotal: true,
        },
      },
      postEvent: {
        create: {
          linkResenaEnviado: false,
          encuestado: false,
        },
      },
    },
  });

  // 10) Cancelado (para probar filtros de estado)
  await prisma.order.create({
    data: {
      clienteId: clienteStartup.id,
      nombreEvento: "Meetup Cripto (cancelado por lluvia)",
      ubicacionDireccion: "Puerto Madero, CABA",
      fechaHoraEntrega: daysFromNow(-5, 18, 0),
      fechaHoraRetiro: daysFromNow(-5, 23, 0),
      cantidadDias: 1,
      estadoEvento: "CANCELADO",
      items: { create: [{ equipmentModel: "TOTEM_TACTIL_PCAP", cantidad: 1 }] },
      insurance: { create: { requiereSeguro: false, estado: "NO_REQUERIDO" } },
      payment: {
        create: {
          precioTotal: 150000,
          tipoFactura: "SIN_FACTURA",
          condicionPago: "EFECTIVO",
          montoSena: 50000,
          senaPagada: true,
          pagadoTotal: false,
        },
      },
    },
  });

  console.log("✅ Seed completo:", {
    clientes: 6,
    equipos: inventoryPlan.reduce((s, i) => s + i.count, 0),
    ordenes: 10,
    ids: [order1.id, order2.id, order3.id, order4.id, order5.id, order6.id, order7.id, order8.id, order9.id],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
