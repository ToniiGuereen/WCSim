import { Component, OnInit } from '@angular/core';
import { CoachingViewModel } from './model/coaching-view-model.interface';
import { CoachingService } from './service/coaching.service';

interface CoachingPageData {
  coachName: string;
  coachNationality: string;
  coachAge: string;
  coachProfile: string;
  coachProfileDescription: string;
  currentStrategy: string;
  currentFormation: string;
  attackRating: string;
  midfieldRating: string;
  defenseRating: string;
  overallRating: string;
}

interface CoachingMetric {
  label: string;
  value: number;
}

interface TeamRatingMetric {
  label: string;
  value: number;
  baseValue: number;
  delta: number;
}

@Component({
  selector: 'app-coaching-page',
  standalone: false,
  templateUrl: './coaching.component.html',
  styleUrls: ['./coaching.component.css'],
})
export class CoachingPageComponent implements OnInit {
  viewModel: CoachingViewModel;

  constructor(private readonly coachingService: CoachingService) {
    this.viewModel = this.coachingService.getViewModel();
  }

  ngOnInit(): void {
    this.coachingService.initialize();
  }

  get isLoading(): boolean {
    return this.viewModel.loading;
  }

  get hasError(): boolean {
    return this.viewModel.errorMessage !== '';
  }

  get isEmpty(): boolean {
    return !this.isLoading && !this.hasError && this.viewModel.coach === null;
  }

  get coachingData(): CoachingPageData | null {
    if (!this.viewModel.coach) {
      return null;
    }

    return {
      coachName: this.viewModel.coach.name,
      coachNationality: this.viewModel.coach.nationality,
      coachAge: this.viewModel.coach.age
        ? this.viewModel.coach.age.toString()
        : '--',
      coachProfile:
        this.viewModel.coach.profileLabel ?? this.viewModel.coach.profile,
      coachProfileDescription:
        this.viewModel.coach.profileDescription ??
        'Profile description pending from API.',
      currentStrategy:
        this.viewModel.selectedStrategy ||
        this.viewModel.strategy?.strategy ||
        this.viewModel.stats?.current_strategy ||
        '--',
      currentFormation:
        this.viewModel.selectedFormation ||
        this.viewModel.formation?.formation ||
        this.viewModel.stats?.current_formation ||
        '--',
      attackRating: this.viewModel.stats?.attack?.toString() ?? '--',
      midfieldRating: this.viewModel.stats?.midfield?.toString() ?? '--',
      defenseRating: this.viewModel.stats?.defense?.toString() ?? '--',
      overallRating: this.viewModel.stats?.overall?.toString() ?? '--',
    };
  }

  get coachMetrics(): CoachingMetric[] {
    if (!this.viewModel.coach) {
      return [];
    }

    return [
      { label: 'Toma de riesgos', value: this.viewModel.coach.riskAppetite },
      { label: 'Manejo del partido', value: this.viewModel.coach.gameManagement },
      { label: 'Adaptación táctica', value: this.viewModel.coach.adaptability },
      { label: 'Intensidad de presión', value: this.viewModel.coach.pressingBias },
      { label: 'Tendencia a la posesión', value: this.viewModel.coach.possessionBias },
      { label: 'Solidez defensiva', value: this.viewModel.coach.defenseBias },
    ];
  }

  get teamRatingMetrics(): TeamRatingMetric[] {
    const baseRatings = this.viewModel.baseRatings ?? [];
    const effectiveRatings = this.viewModel.effectiveRatings ?? [];
    const ratingDeltas = this.viewModel.ratingDeltas ?? [];

    if (!baseRatings.length || !effectiveRatings.length) {
      return [];
    }

    return [
      this.buildTeamRatingMetric(
        'Ataque',
        'ATTACK',
        baseRatings,
        effectiveRatings,
        ratingDeltas,
      ),
      this.buildTeamRatingMetric(
        'Mediocampo',
        'MIDFIELD',
        baseRatings,
        effectiveRatings,
        ratingDeltas,
      ),
      this.buildTeamRatingMetric(
        'Defensa',
        'DEFENSE',
        baseRatings,
        effectiveRatings,
        ratingDeltas,
      ),
      this.buildTeamRatingMetric(
        'General',
        'OVERALL',
        baseRatings,
        effectiveRatings,
        ratingDeltas,
      ),
    ];
  }

  onStrategyChange(event: Event): void {
    const strategy = (event.target as HTMLSelectElement).value;
    this.coachingService.updateStrategy(strategy);
  }

  onFormationChange(event: Event): void {
    const formation = (event.target as HTMLSelectElement).value;
    this.coachingService.updateFormation(formation);
  }

  onResetTactics(): void {
    this.coachingService.resetTactics();
  }

  private buildTeamRatingMetric(
    label: string,
    metric: string,
    baseRatings: { metric: string; value: number }[],
    effectiveRatings: { metric: string; value: number }[],
    ratingDeltas: { metric: string; totalDelta: number }[],
  ): TeamRatingMetric {
    const baseValue =
      baseRatings.find((rating) => rating.metric === metric)?.value ?? 0;

    const effectiveValue =
      effectiveRatings.find((rating) => rating.metric === metric)?.value ??
      baseValue;

    const delta =
      ratingDeltas.find((ratingDelta) => ratingDelta.metric === metric)
        ?.totalDelta ?? 0;

    return {
      label,
      value: effectiveValue,
      baseValue,
      delta,
    };
  }
}