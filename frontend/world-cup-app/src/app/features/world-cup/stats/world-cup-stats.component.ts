import { Component, OnInit } from '@angular/core';
import { WorldCupStatsService } from './service/world-cup-stats.service';
import { WorldCupStatsViewModel } from './model/world-cup-stats-view-model.interface';

@Component({
  selector: 'app-world-cup-stats-page',
  standalone: false,
  templateUrl: './world-cup-stats.component.html',
  styleUrls: ['./world-cup-stats.component.css'],
})
export class WorldCupStatsPageComponent implements OnInit {

  constructor(private readonly statsService: WorldCupStatsService) {}

  // El HTML accede a los datos a través de este getter.
  // Cada vez que Angular re-renderiza, llama a este getter y obtiene el estado actualizado.
  get pageState(): WorldCupStatsViewModel {
    return this.statsService.getViewModel();
  }

  // Angular llama a ngOnInit automáticamente cuando el componente se carga.
  // Acá le decimos al service que arranque a cargar los datos.
  ngOnInit(): void {
    this.statsService.initialize();
  }
}
