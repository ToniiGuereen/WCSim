import { Component, OnInit } from "@angular/core";
import { LiveEventsService } from "./service/live-events.service";
@Component({
  selector: "app-live-events-page",
  standalone: false,
  templateUrl: "./live-events.component.html",
  styleUrls: ["./live-events.component.css"],
})
export class LiveEventsPageComponent implements OnInit {
  eventosEnVivo: any[] = [];

  constructor(private liveEventsService: LiveEventsService) {}

  ngOnInit() {
    this.liveEventsService.obtenerEventosGeniales().subscribe({
      next: (respuesta) => {
        this.eventosEnVivo = respuesta.data;
      },
      error: (error) => {
        console.error("Error al traer eventos:", error);
      },
    });
  }
}
