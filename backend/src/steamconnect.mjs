import { readJSONSync } from "fs-extra";
import SteamAPI from "steamapi";
const Secrets = readJSONSync("secrets.json");
const Steam = new SteamAPI(Secrets.steamapikey);
Steam;
//# sourceMappingURL=steamconnect.mjs.map