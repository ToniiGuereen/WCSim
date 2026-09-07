import { Component, OnInit } from '@angular/core';
import { TeamStateService } from './service/team-state.service';
import { TeamStateViewModel } from './model/team-state-view-model.interface';


@Component({
  selector: 'app-team-state-page',
  standalone: false,
  templateUrl: './team-state.component.html',
  styleUrls: ['./team-state.component.css'],
})
export class TeamStatePageComponent implements OnInit {

  vm: TeamStateViewModel = {
    lang: 'es',
    loading: true,
    errorMessage: '',
    showNoFinalState: false,
    data: null,
  };

  constructor(private readonly teamStateService: TeamStateService) {}

  ngOnInit(): void {
    this.teamStateService.getTeamState().subscribe({
      next: (data) => {
        this.vm = data;
      },
      error: () => {
        this.vm.loading = false;
        this.vm.errorMessage = 'Error al cargar los datos.';
      }
    });
  }
}