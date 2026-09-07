import { Component, OnInit } from '@angular/core';
import { MatchStageCode } from './model/matches-api.interface';
import { MatchesViewModel } from './model/matches-view-model.interface';
import { MatchesService } from './service/matches.service';

@Component({
  selector: 'app-matches-page',
  standalone: false,
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.css'],
})
export class MatchesPageComponent implements OnInit {
  constructor(private readonly matchesService: MatchesService) {}

  get pageState(): MatchesViewModel {
    return this.matchesService.getViewModel();
  }

  ngOnInit(): void {
    this.matchesService.initialize();
  }

  onStageChange(stage: MatchStageCode): void {
    this.matchesService.setStage(stage);
  }
}
