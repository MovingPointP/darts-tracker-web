export type GameType = "01game" | "cricket" | "countup";

export const GAME_TYPE_LABELS: Record<GameType, string> = {
  "01game": "01Game",
  cricket: "クリケット",
  countup: "COUNTUP",
};

export interface GameRecord {
  id: number;
  user_id: string;
  game_type: GameType;
  value: number;
  rating: number | null;
  played_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGameRecordInput {
  game_type: GameType;
  value: number;
  played_at: string;
}

export interface UpdateGameRecordInput {
  value: number;
  played_at: string;
}
