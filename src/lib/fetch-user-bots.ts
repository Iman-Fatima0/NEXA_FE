import { bffJson } from "./api/bff-json";
import { BFF_PATHS } from "./api/bff-paths";
import type { UserBot, UserBotsPayload } from "./user-bots-types";

export async function fetchUserBots(): Promise<UserBotsPayload> {
  return bffJson<UserBotsPayload>(BFF_PATHS.userBots);
}

export type UserBotByIdPayload = { bot: UserBot };

export async function fetchUserBotById(id: string): Promise<UserBot> {
  const body = await bffJson<UserBotByIdPayload>(BFF_PATHS.userBot(id));
  return body.bot;
}
