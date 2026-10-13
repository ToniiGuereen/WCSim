import { Position, SquadPlayer, TeamDef } from '../domain';
import { clamp, createRng, hashString } from '../rng';
import { mustTeam } from './catalog';

// [nombre, dorsal, posición, edad, skill, ataque, defensa, energía, capitán?]
type Row = [string, number, Position, number, number, number, number, number, boolean?];

const fromRows = (teamId: string, rows: Row[]): SquadPlayer[] =>
  rows.map(([name, shirtNumber, position, age, skill, attack, defense, energy, captain]) => ({
    id: `${teamId}-${shirtNumber}`,
    name,
    shirtNumber,
    position,
    age,
    skill,
    attack,
    defense,
    energy,
    isCaptain: !!captain,
  }));

const ARG: Row[] = [
  ['Emiliano Martínez', 23, 'GK', 33, 91, 15, 94, 95],
  ['Gerónimo Rulli', 1, 'GK', 34, 81, 10, 83, 100],
  ['Nahuel Molina', 26, 'DF', 28, 84, 76, 83, 92],
  ['Cristian Romero', 13, 'DF', 28, 90, 45, 93, 88],
  ['Nicolás Otamendi', 19, 'DF', 38, 85, 48, 88, 78],
  ['Nicolás Tagliafico', 3, 'DF', 33, 83, 70, 84, 85],
  ['Gonzalo Montiel', 4, 'DF', 29, 80, 71, 81, 95],
  ['Lisandro Martínez', 25, 'DF', 28, 88, 55, 90, 90],
  ['Rodrigo De Paul', 7, 'MF', 32, 87, 81, 84, 86],
  ['Enzo Fernández', 24, 'MF', 25, 88, 84, 82, 94],
  ['Alexis Mac Allister', 20, 'MF', 27, 89, 85, 80, 91],
  ['Leandro Paredes', 5, 'MF', 31, 83, 79, 81, 93],
  ['Giovani Lo Celso', 16, 'MF', 30, 82, 83, 72, 90],
  ['Lionel Messi', 10, 'FW', 38, 94, 96, 40, 82, true],
  ['Julián Álvarez', 9, 'FW', 26, 89, 91, 68, 96],
  ['Lautaro Martínez', 22, 'FW', 28, 90, 92, 55, 89],
  ['Nicolás González', 15, 'FW', 28, 82, 82, 65, 95],
  ['Alejandro Garnacho', 17, 'FW', 21, 83, 86, 42, 98],
];

const FRA: Row[] = [
  ['Mike Maignan', 16, 'GK', 30, 90, 14, 92, 94],
  ['Brice Samba', 1, 'GK', 32, 82, 10, 84, 100],
  ['Jules Koundé', 5, 'DF', 27, 87, 66, 88, 90],
  ['Dayot Upamecano', 4, 'DF', 27, 85, 48, 87, 88],
  ['William Saliba', 17, 'DF', 25, 89, 50, 91, 92],
  ['Theo Hernández', 22, 'DF', 28, 86, 77, 83, 90],
  ['Benjamin Pavard', 2, 'DF', 30, 82, 60, 83, 96],
  ['Ibrahima Konaté', 24, 'DF', 27, 85, 45, 87, 95],
  ['Aurélien Tchouaméni', 8, 'MF', 26, 87, 72, 87, 91],
  ['Adrien Rabiot', 14, 'MF', 31, 85, 76, 82, 88],
  ['Antoine Griezmann', 7, 'MF', 35, 86, 84, 70, 85],
  ['Eduardo Camavinga', 6, 'MF', 23, 86, 74, 83, 96],
  ['Youssouf Fofana', 18, 'MF', 27, 82, 72, 79, 98],
  ['Kylian Mbappé', 10, 'FW', 27, 95, 97, 40, 90, true],
  ['Ousmane Dembélé', 11, 'FW', 29, 90, 91, 45, 88],
  ['Marcus Thuram', 9, 'FW', 29, 86, 87, 48, 92],
  ['Randal Kolo Muani', 12, 'FW', 27, 82, 84, 42, 99],
  ['Michael Olise', 20, 'FW', 24, 86, 86, 45, 97],
];

/** Figuras referenciales para el resto de las selecciones (el plantel se completa de forma procedural). */
const STARS: Record<string, [string, Position][]> = {
  bra: [['Alisson', 'GK'], ['Marquinhos', 'DF'], ['Bruno Guimarães', 'MF'], ['Raphinha', 'FW'], ['Vinícius Jr', 'FW'], ['Rodrygo', 'FW']],
  esp: [['Unai Simón', 'GK'], ['Dani Carvajal', 'DF'], ['Rodri', 'MF'], ['Pedri', 'MF'], ['Lamine Yamal', 'FW'], ['Nico Williams', 'FW'], ['Mikel Oyarzabal', 'FW']],
  eng: [['Jordan Pickford', 'GK'], ['John Stones', 'DF'], ['Declan Rice', 'MF'], ['Jude Bellingham', 'MF'], ['Harry Kane', 'FW'], ['Bukayo Saka', 'FW'], ['Phil Foden', 'FW']],
  ger: [['Antonio Rüdiger', 'DF'], ['Joshua Kimmich', 'MF'], ['Jamal Musiala', 'MF'], ['Florian Wirtz', 'MF'], ['Kai Havertz', 'FW']],
  por: [['Diogo Costa', 'GK'], ['Rúben Dias', 'DF'], ['Bruno Fernandes', 'MF'], ['Bernardo Silva', 'MF'], ['Cristiano Ronaldo', 'FW'], ['Rafael Leão', 'FW']],
  ned: [['Virgil van Dijk', 'DF'], ['Denzel Dumfries', 'DF'], ['Frenkie de Jong', 'MF'], ['Cody Gakpo', 'FW'], ['Memphis Depay', 'FW']],
  uru: [['José María Giménez', 'DF'], ['Ronald Araújo', 'DF'], ['Federico Valverde', 'MF'], ['Rodrigo Bentancur', 'MF'], ['Darwin Núñez', 'FW']],
  col: [['Camilo Vargas', 'GK'], ['Davinson Sánchez', 'DF'], ['James Rodríguez', 'MF'], ['Luis Díaz', 'FW']],
  ita: [['Gianluigi Donnarumma', 'GK'], ['Alessandro Bastoni', 'DF'], ['Nicolò Barella', 'MF'], ['Federico Chiesa', 'FW']],
  bel: [['Thibaut Courtois', 'GK'], ['Kevin De Bruyne', 'MF'], ['Jérémy Doku', 'FW'], ['Romelu Lukaku', 'FW']],
  cro: [['Joško Gvardiol', 'DF'], ['Luka Modrić', 'MF'], ['Mateo Kovačić', 'MF'], ['Andrej Kramarić', 'FW']],
  usa: [['Matt Turner', 'GK'], ['Tyler Adams', 'MF'], ['Weston McKennie', 'MF'], ['Christian Pulisic', 'FW']],
  mex: [['Guillermo Ochoa', 'GK'], ['Edson Álvarez', 'MF'], ['Hirving Lozano', 'FW'], ['Santiago Giménez', 'FW']],
  can: [['Maxime Crépeau', 'GK'], ['Alphonso Davies', 'DF'], ['Tajon Buchanan', 'FW'], ['Jonathan David', 'FW']],
  jpn: [['Takehiro Tomiyasu', 'DF'], ['Wataru Endo', 'MF'], ['Kaoru Mitoma', 'FW'], ['Takefusa Kubo', 'FW']],
  kor: [['Kim Min-jae', 'DF'], ['Lee Kang-in', 'MF'], ['Hwang Hee-chan', 'FW'], ['Son Heung-min', 'FW']],
  mar: [['Yassine Bounou', 'GK'], ['Achraf Hakimi', 'DF'], ['Hakim Ziyech', 'MF'], ['Brahim Díaz', 'FW']],
  sen: [['Édouard Mendy', 'GK'], ['Kalidou Koulibaly', 'DF'], ['Sadio Mané', 'FW'], ['Nicolas Jackson', 'FW']],
  den: [['Kasper Schmeichel', 'GK'], ['Pierre-Emile Højbjerg', 'MF'], ['Christian Eriksen', 'MF'], ['Rasmus Højlund', 'FW']],
  nor: [['Martin Ødegaard', 'MF'], ['Alexander Sørloth', 'FW'], ['Erling Haaland', 'FW']],
  sui: [['Yann Sommer', 'GK'], ['Manuel Akanji', 'DF'], ['Granit Xhaka', 'MF'], ['Breel Embolo', 'FW']],
  egy: [['Mohamed El Shenawy', 'GK'], ['Omar Marmoush', 'FW'], ['Mohamed Salah', 'FW']],
  alg: [['Ismaël Bennacer', 'MF'], ['Riyad Mahrez', 'FW']],
};

const CAPTAIN_BY_TEAM: Record<string, string> = {
  bra: 'Marquinhos',
  uru: 'Federico Valverde',
  ger: 'Joshua Kimmich',
  eng: 'Harry Kane',
  ned: 'Virgil van Dijk',
  por: 'Cristiano Ronaldo',
};

const POSITION_LABEL: Record<Position, string> = { GK: 'Arquero', DF: 'Defensor', MF: 'Volante', FW: 'Delantero' };

// [posición, dorsal]
const SLOTS: [Position, number][] = [
  ['GK', 1], ['GK', 23],
  ['DF', 2], ['DF', 3], ['DF', 4], ['DF', 5], ['DF', 13], ['DF', 15],
  ['MF', 6], ['MF', 8], ['MF', 14], ['MF', 16], ['MF', 18],
  ['FW', 7], ['FW', 9], ['FW', 10], ['FW', 11], ['FW', 17],
];

function generate(team: TeamDef): SquadPlayer[] {
  const rng = createRng(hashString(`squad:${team.id}`));
  const stars = STARS[team.id] ?? [];
  const usedStars = new Set<number>();
  const bench = new Set([1, 23, 13, 15, 16, 18, 11, 17]);

  const players = SLOTS.map(([position, shirtNumber]): SquadPlayer => {
    const starIndex = stars.findIndex((s, i) => !usedStars.has(i) && s[1] === position);
    const isStar = starIndex >= 0;
    if (isStar) usedStars.add(starIndex);

    const base = team.rating + (bench.has(shirtNumber) && !isStar ? -5 : 0);
    const skill = clamp(base + rng.int(-4, 3) + (isStar ? rng.int(2, 5) : 0), 52, 97);
    const young = !isStar && (shirtNumber === 17 || shirtNumber === 18);

    let attack: number;
    let defense: number;
    if (position === 'GK') {
      attack = rng.int(8, 18);
      defense = skill + rng.int(0, 3);
    } else if (position === 'DF') {
      defense = skill + rng.int(0, 5);
      attack = skill - rng.int(18, 30);
    } else if (position === 'MF') {
      attack = skill + rng.int(-4, 3);
      defense = skill - rng.int(0, 8);
    } else {
      attack = skill + rng.int(0, 5);
      defense = skill - rng.int(25, 40);
    }

    return {
      id: `${team.id}-${shirtNumber}`,
      name: isStar ? stars[starIndex][0] : `${POSITION_LABEL[position]} ${shirtNumber} ${team.id.toUpperCase()}`,
      shirtNumber,
      position,
      age: young ? rng.int(18, 21) : position === 'GK' ? rng.int(24, 37) : rng.int(22, 34),
      skill,
      attack: clamp(attack, 8, 99),
      defense: clamp(defense, 20, 99),
      energy: rng.int(86, 100),
      isCaptain: false,
    };
  });

  const wanted = CAPTAIN_BY_TEAM[team.id];
  const captain =
    players.find((p) => p.name === wanted) ??
    [...players].filter((p) => p.position !== 'GK').sort((a, b) => b.skill - a.skill)[0];
  captain.isCaptain = true;
  return players;
}

const cache = new Map<string, SquadPlayer[]>();

/** Plantel de 18 jugadores (2 GK, 6 DF, 5 MF, 5 FW). Determinista y de solo lectura. */
export function getSquad(teamId: string): SquadPlayer[] {
  const id = teamId.trim().toLowerCase();
  let squad = cache.get(id);
  if (!squad) {
    if (id === 'arg') squad = fromRows('arg', ARG);
    else if (id === 'fra') squad = fromRows('fra', FRA);
    else squad = generate(mustTeam(id));
    cache.set(id, squad);
  }
  return squad;
}

export const captainOf = (teamId: string): SquadPlayer => {
  const squad = getSquad(teamId);
  return squad.find((p) => p.isCaptain) ?? squad[0];
};
