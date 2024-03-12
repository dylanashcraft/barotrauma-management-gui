export interface Player {
  playername: string;
  accountname: string
  playerid: string;
  type: "steam"|"other"
  aliases?: Set<string>
}