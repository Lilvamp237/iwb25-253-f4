type UtcTimestamp = string;

export interface Reply {
  readonly id: number;
  text: string;
  timestamp: UtcTimestamp;
  replies: Reply[]; // Nested replies
}

export interface Message {
  readonly id: number;
  text: string;
  lat: number;
  lon: number;
  timestamp: UtcTimestamp;
  replies: Reply[];
}