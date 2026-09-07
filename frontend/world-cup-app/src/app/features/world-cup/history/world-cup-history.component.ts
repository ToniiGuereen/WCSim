import { Component, OnInit, inject } from '@angular/core';
import { WorldCupHistoryService } from './service/world-cup-history.service';
import { WorldCupHistoryViewModel } from './model/world-cup-history-view-model.interface';

@Component({
  selector: 'app-world-cup-history-page',
  standalone: false,
  templateUrl: './world-cup-history.component.html',
  styleUrls: ['./world-cup-history.component.css'],
})
export class WorldCupHistoryPageComponent implements OnInit {
  private readonly worldCupHistoryService = inject(WorldCupHistoryService);

  public pageState: WorldCupHistoryViewModel = this.worldCupHistoryService.getViewModel();

  ngOnInit(): void {
    this.worldCupHistoryService.loadHistory().subscribe();
  }
}
