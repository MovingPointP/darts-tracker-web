export type GameType = "01game" | "cricket" | "countup";

export const GAME_TYPE_LABELS: Record<GameType, string> = {
  "01game": "01Game",
  cricket: "クリケット",
  countup: "COUNTUP",
};

export const VALUE_COLUMN_LABELS: Record<GameType, string> = {
  "01game": "PPR",
  cricket: "MPR",
  countup: "SCORE",
};

export const AWARDS = {
  ONE_BULL:           "ONE BULL",
  LOW_TON:            "LOW TON",
  HIGH_TON:           "HIGH TON",
  TON_80:             "TON 80",
  HAT_TRICK:          "HAT TRICK",
  THREE_IN_THE_BLACK: "3 IN THE BLACK",
  THREE_IN_A_BED:     "3 IN A BED",
  WHITE_HORSE:        "WHITE HORSE",
  FIVE_MARK:          "5 MARK",
  NINE_MARK:          "9 MARK",
} as const;

export type Award = (typeof AWARDS)[keyof typeof AWARDS];

export const AWARDS_BY_GAME_TYPE: Record<GameType, Award[]> = {
  "01game": [
    AWARDS.ONE_BULL,
    AWARDS.LOW_TON,
    AWARDS.HIGH_TON,
    AWARDS.TON_80,
    AWARDS.HAT_TRICK,
    AWARDS.THREE_IN_THE_BLACK,
  ],
  cricket: [
    AWARDS.ONE_BULL,
    AWARDS.TON_80,
    AWARDS.HAT_TRICK,
    AWARDS.THREE_IN_THE_BLACK,
    AWARDS.THREE_IN_A_BED,
    AWARDS.WHITE_HORSE,
    AWARDS.FIVE_MARK,
    AWARDS.NINE_MARK,
  ],
  countup: [
    AWARDS.ONE_BULL,
    AWARDS.LOW_TON,
    AWARDS.HIGH_TON,
    AWARDS.TON_80,
    AWARDS.HAT_TRICK,
    AWARDS.THREE_IN_THE_BLACK,
  ],
};

export interface GameRecord {
  id: number;
  user_id: string;
  game_type: GameType;
  value: number;
  rating: number | null;
  awards: Record<string, number>;
  played_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGameRecordInput {
  game_type: GameType;
  value: number;
  played_at: string;
  awards: Record<string, number>;
}

export interface UpdateGameRecordInput {
  value: number;
  played_at: string;
  awards: Record<string, number>;
}

export interface PagedRecords {
  records: GameRecord[];
  total: number;
  limit: number;
  offset: number;
}

export interface DailyRating {
  date: string;
  rating: number;
}
