import { EmbedField } from "discord.js";
import { Bot } from "../classes/Client";

export const checkLog = function (client: Bot, log: string): EmbedField[] {
  if (log === "Empty") return [];
  const fields: EmbedField[] = [];
  client.triggers.forEach((v, k) => {
    if (log.includes(k)) {
      const field: EmbedField = {
        name: `\u200b`,
        value: v.join("\n"),
        inline: false,
      };
      if (!fields.includes(field)) fields.push(field);
    }
  });
  return fields;
};
