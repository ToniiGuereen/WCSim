import { NextRequest } from 'next/server';
import { proxyOrFallback } from '../../proxyHelper';
import { FinalChatState } from '@/types';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({ selectedOption: 1 }));
  const selectedOption = body.selectedOption ?? 1;

  // Rich turn progression simulation
  const mockTurnState: FinalChatState = {
    isFinished: false,
    minute: Math.min(90, 15 + selectedOption * 12),
    turn: selectedOption + 1,
    score: selectedOption >= 2 ? 'ARG 1 - 0 FRA' : 'ARG 0 - 0 FRA',
    zone: selectedOption % 2 === 0 ? 'ÁREA_RIVAL' : 'TRES_CUARTOS',
    possession: 'ARGENTINA',
    teamName: 'Argentina',
    opponentName: 'Francia',
    messageItems: [
      { minute: 15, text: 'Gran conducción individual de Lionel Messi eludiendo a dos rivales.', type: 'narrative' },
      {
        minute: 23,
        text: selectedOption >= 2
          ? '¡¡¡GOOOOOOOL DE ARGENTINA!!! Disparo fulminante al ángulo superior derecho imposible para el arquero.'
          : 'Pase filtrado peligroso que corta la defensa francesa con lo justo al tiro de esquina.',
        type: selectedOption >= 2 ? 'goal' : 'narrative'
      },
      { minute: 28, text: 'El equipo mantiene la presión alta y recupera rápido la posesión.', type: 'tactical' },
    ],
    options: [
      { index: 1, label: 'Controlar el ritmo y jugar hacia atrás', actionCode: 'HOLD' },
      { index: 2, label: 'Probar remate cruzado al segundo palo', actionCode: 'SHOOT' },
      { index: 3, label: 'Desborde y centro al punto penal', actionCode: 'CROSS' },
      { index: 4, label: 'Falta táctica para frenar la réplica', actionCode: 'TACKLE' }
    ]
  };

  return proxyOrFallback('/final-match/play', 'POST', body, mockTurnState);
}
