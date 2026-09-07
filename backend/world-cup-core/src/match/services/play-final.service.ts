import { Injectable } from '@nestjs/common';

@Injectable()
export class PlayFinalService {

  async startFinal() {
    const response = await fetch('http://localhost:5101/worldCup/match/start-final', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lang: 'es',
      }),
    });

    const data = await response.json();

    return data;
  }

  async play(selectedOption: number) {
    const response = await fetch('http://localhost:5101/worldCup/match/play', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        selectedOption,
        lang: 'es',
      }),
    });

    const data = await response.json();

    return data;
  }

  async changeStrategy(strategy: string) {
    const response = await fetch(
      'http://localhost:5101/worldCup/match/select-strategy',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: 'aus',
          strategy,
          lang: 'es',
        }),
      },
    );

    const data = await response.json();
    return data;
  }

  async changeFormation(formation: string) {
    const response = await fetch(
      'http://localhost:5101/worldCup/match/select-formation',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: 'aus',
          formation,
          lang: 'es',
        }),
      },
    );

    const data = await response.json();
    return data;
  }
}