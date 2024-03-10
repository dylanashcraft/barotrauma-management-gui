export interface Player {
  playername: string;
  accountname: string
  playerid: string;
  type: "steam"|"other"
  ip: string
  aliases?: string[]
}