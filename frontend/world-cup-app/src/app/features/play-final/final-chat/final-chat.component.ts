import { Component, OnInit } from '@angular/core';
import { FinalChatService } from './service/final-chat.service';
import { FinalChatApiResponse } from './model/final-chat-api.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-final-chat-page',
  standalone: false,
  templateUrl: './final-chat.component.html',
  styleUrls: ['./final-chat.component.css'],
})
export class FinalChatPageComponent implements OnInit {
  data: FinalChatApiResponse | null = null;

  loading = false;
  sending = false;
  errorMessage = '';
  worldCupNotReady = false;

  chatActionText = '';

  private readonly actionKeywords: Record<string, string[]> = {
    ATTACK: ['atacar', 'ataque', 'ir al ataque'],
    HOLD: ['aguantar', 'mantener', 'pausar', 'esperar'],
    PRESS: ['presionar', 'presion', 'apretar'],
    LONG_PASS: ['pase largo', 'pelotazo'],
    SHOOT: ['patear', 'rematar', 'tirar', 'disparar'],
    PASS: ['pasar', 'pase', 'tocar'],
    DRIBBLE: ['gambetear', 'gambeta', 'encarar'],
    CROSS: ['centro', 'centrar', 'tirar centro'],
    DEFEND: ['defender', 'defensa', 'replegar'],
    TACKLE: ['barrida', 'quitar', 'barrer', 'entrada'],
    BLOCK: ['cerrar', 'bloquear', 'tapar'],

    LEFT: ['izquierda', 'lado izquierdo'],
    RIGHT: ['derecha', 'lado derecho'],
    CENTER: ['por el centro', 'medio', 'centro cancha'],

    PICAR: ['picar', 'pinchar', 'vaselina'],

    DIVE_LEFT: ['tirarse izquierda', 'volar izquierda'],
    DIVE_RIGHT: ['tirarse derecha', 'volar derecha'],
    STAY_CENTER: ['quedarse centro', 'quedarse parado', 'centro arco'],

    WAIT: ['espero', 'esperar', 'aguardar'],

    RESTART_MATCH: ['reanudar', 'reiniciar', 'nuevo partido'],

    QUIT_MATCH: ['salir', 'abandonar', 'rendirse'],
  };

  constructor(
    private finalChatService: FinalChatService,
    private router: Router,
  ) {}

  ngOnInit(): void {}

  startFinal(): void {
    this.sending = true;
    this.errorMessage = '';
    this.worldCupNotReady = false;

    this.finalChatService.startFinal().subscribe({
      next: (response: FinalChatApiResponse) => {
        this.data = response;
        this.sending = false;
      },

      error: () => {
        this.errorMessage = 'Primero se debe simular el mundial.';
        this.worldCupNotReady = true;
        this.sending = false;
      },
    });
  }

  play(selectedOption: number): void {
    this.sending = true;
    this.errorMessage = '';

    this.finalChatService.play(selectedOption).subscribe({
      next: (response: FinalChatApiResponse) => {
        this.data = response;
        this.sending = false;
      },

      error: () => {
        this.errorMessage = 'No se pudo jugar la final.';
        this.sending = false;
      },
    });
  }

  sendChatAction(): void {
    const text = this.chatActionText.trim();

    if (!text) {
      this.errorMessage = 'Escribí una acción para continuar el partido.';
      return;
    }

    const action = this.detectActionFromText(text);

    if (!action) {
      this.errorMessage =
        'No entendí la acción. Probá con patear, pasar, gambetear, defender o presionar.';
      return;
    }

    const availableOption = this.data?.options.find(
      (option) => option.action === action,
    );

    if (!availableOption) {
      this.errorMessage =
        'Esa acción no está disponible en este momento. Elegí una de las opciones del turno.';
      return;
    }

    this.chatActionText = '';
    this.play(availableOption.index);
  }

  private detectActionFromText(text: string): string | null {
    const normalizedText = this.normalizeText(text);

    for (const [action, keywords] of Object.entries(this.actionKeywords)) {
      const hasKeyword = keywords.some((keyword) =>
        normalizedText.includes(this.normalizeText(keyword)),
      );

      if (hasKeyword) {
        return action;
      }
    }

    return null;
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  restartFinal(): void {
    this.data = null;
    this.errorMessage = '';
    this.worldCupNotReady = false;

    this.startFinal();
  }

  changeStrategy(strategy: string): void {
    this.sending = true;
    this.errorMessage = '';

    this.finalChatService.changeStrategy(strategy).subscribe({
      next: () => {
        if (this.data) {
          this.data.teamStrategy = strategy;
        }

        this.sending = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cambiar la estrategia.';
        this.sending = false;
      },
    });
  }

  changeFormation(formation: string): void {
    this.sending = true;
    this.errorMessage = '';

    this.finalChatService.changeFormation(formation).subscribe({
      next: () => {
        if (this.data) {
          this.data.teamFormation = formation;
        }

        this.sending = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cambiar la formación.';
        this.sending = false;
      },
    });
  }

  translateZone(zone: string | null): string {
    const zones: Record<string, string> = {
      MIDFIELD: 'Mediocampo',
      BOX: 'Área',
      DEFENSE: 'Defensa',
      ATTACK: 'Ataque',
    };

    return zone ? zones[zone] || zone : '-';
  }

  translatePossession(possession: string): string {
    if (possession === 'USER') {
      return this.data?.teamName ?? 'Mi equipo';
    }

    if (possession === 'OPPONENT') {
      return this.data?.opponentName ?? 'Rival';
    }

    return possession;
  }

  translateStrategy(strategy: string): string {
    const strategies: Record<string, string> = {
      ATTACK: 'Ofensivo',
      BALANCED: 'Equilibrado',
      DEFENSE: 'Defensivo',
      COUNTER_ATTACK: 'Contrataque',
      POSSESSION: 'Posesivo',
    };

    return strategies[strategy] || strategy;
  }

  translateFormation(formation: string | null): string {
    return formation || '-';
  }

  translateProfile(profile: string): string {
    const profiles: Record<string, string> = {
      BALANCED: 'Equilibrado',
      AGGRESSIVE: 'Ofensivo',
      PRAGMATIC: 'Eficaz',
      DEFENSIVE: 'Defensivo',
    };

    return profiles[profile] || profile;
  }

  translateResult(result: string | null): string {
    const results: Record<string, string> = {
      WIN: 'Victoria',
      LOSS: 'Derrota',
      DRAW: 'Empate',
    };

    return result ? results[result] || result : 'En juego';
  }

  goToSimulateFinal(): void {
    this.router.navigate(['/world-cup/simulate']);
  }
}