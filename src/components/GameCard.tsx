import { Link } from "react-router"

import type { GameSummary } from "../lib/games"

type GameCardProps = {
  game: GameSummary
}

export const GameCard = ({ game }: GameCardProps) => {
  return (
    <article>
      <h2>{game.meta.title}</h2>
      <p>{game.meta.description}</p>
      <Link to={`/game/${game.gameId}`} aria-label={`${game.meta.title}を開始`}>
        開始
      </Link>
    </article>
  )
}
