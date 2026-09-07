import { Component, Input } from '@angular/core';
import { APP_ROUTES } from '../../core/constants/app-routes';

interface NavItem {
  id: string;
  route: string;
  label: string;
  icon: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: false,
})
export class SidebarComponent {
  @Input() teamName = 'Argentina';
  @Input() teamFlag = '⚽';

  readonly sections: NavSection[] = [
    {
      title: 'Mi equipo',
      items: [
        { id: 'squad', route: APP_ROUTES.myTeam.squad, label: 'Plantel', icon: '⚽' },
        { id: 'coaching', route: APP_ROUTES.myTeam.coaching, label: 'Cuerpo técnico', icon: '📋' },
        { id: 'history', route: APP_ROUTES.myTeam.history, label: 'Historia', icon: '🏆' },
        { id: 'rivals', route: APP_ROUTES.myTeam.rivals, label: 'Rivales', icon: '⚔️' },
      ],
    },
    {
      title: 'Mundial',
      items: [
        { id: 'simulate', route: APP_ROUTES.worldCup.simulate, label: 'Simular', icon: '▶️' },
        { id: 'groups', route: APP_ROUTES.worldCup.groups, label: 'Grupos', icon: '📊' },
        { id: 'journey', route: APP_ROUTES.worldCup.journey, label: 'Camino', icon: '🛤️' },
        { id: 'matches', route: APP_ROUTES.worldCup.matches, label: 'Partidos', icon: '📅' },
        { id: 'stats', route: APP_ROUTES.worldCup.stats, label: 'Estadísticas', icon: '📊' },
        { id: 'history-wc', route: APP_ROUTES.worldCup.history, label: 'Historial', icon: '📜' },
      ],
    },
    {
      title: 'Final',
      items: [
        { id: 'live', route: APP_ROUTES.finalMatch.live, label: 'En vivo', icon: '🔴' },
        { id: 'team-state', route: APP_ROUTES.finalMatch.teamState, label: 'Estado', icon: '📊' },
        { id: 'chat', route: APP_ROUTES.finalMatch.chat, label: 'Jugar', icon: '🎮' },
      ],
    },
  ];
}
