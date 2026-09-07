import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { LiveEventsService } from "../services/live-events.service";
@ApiTags("final-match")
@Controller("final-match")
export class LiveEventsController {
  constructor(private readonly liveEventsService: LiveEventsService) {}

  @Get("eventos-prueba")
  obtenerEventosGeniales() {
    return this.liveEventsService.obtenerEventosHardcodeados();
  }
  @Get("eventos-geniales-api")
  async obtenerEventosGenialesApi() {
    return await this.liveEventsService.obtenerEventosReal();
  }
}
