//I'm just putting down my thoughts in code form RN

import {readJSONSync} from "fs-extra";
import SteamAPI from "steamapi";

interface secrets{
  steamapikey: string
}

const Secrets: secrets = readJSONSync("secrets.json");
const Steam = new SteamAPI(Secrets.steamapikey);