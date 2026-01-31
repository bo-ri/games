import type { GameSummary } from "../lib/games"
import { GameCard } from "./GameCard"

type GameListProps = {
  games: GameSummary[]
}

export const GameList = ({ games }: GameListProps) => {
  return (
    <div>
      {games.map((game) => (
        <GameCard key={game.gameId} game={game} />
      ))}
    </div>
  )
}
