import { BrowserRouter, Route, Routes } from "react-router"

import { GameStartPage } from "./components/GameStartPage"
import { TopPage } from "./components/TopPage"

export const App = () => {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/game/:gameId" element={<GameStartPage />} />
      </Routes>
    </BrowserRouter>
  )
}
