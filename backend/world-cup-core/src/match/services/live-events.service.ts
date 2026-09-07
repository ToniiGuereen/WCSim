import { Injectable } from "@nestjs/common";

@Injectable()
export class LiveEventsService {
  // TODO: Se debe implementar el controlador y el servicio correspondiente.
  obtenerEventosHardcodeados() {
    // simulo datos porque sqlite3 no arranca en windows
    const eventosFalsos = [
      {
        id: 1,
        tipo: "GOL",
        minuto: 12,
        descripcion: "Golazo de Messi de tiro libre!",
      },
      {
        id: 2,
        tipo: "TARJETA_ROJA",
        minuto: 30,
        descripcion: "Tarjeta roja para De Paul",
      },
      {
        id: 3,
        tipo: "GOL",
        minuto: 43,
        descripcion: "Gol de Lautaro Martinez de cabeza",
      },
      {
        id: 4,
        tipo: "TARJETA_AMARILLA",
        minuto: 55,
        descripcion: "Tarjeta amarilla para Dibu Martinez",
      },
    ];

    return eventosFalsos;
  }

async obtenerEventosReal() {
  const respuesta = await fetch('http://localhost:5101/worldCup/match/message-types');
  const datos = await respuesta.json();
  return datos;
}
}

