import { EmbedField } from "discord.js";
import { Bot } from "../classes/Client";
import { triggers } from "../config/triggers";

export const checkLog = function (client: Bot, log: string): EmbedField[] {
  if (log === "Empty") return [];
  const fields: EmbedField[] = [];
  triggers.forEach((trigger) => {
    trigger.keys.every((key) => {
      if (log.includes(key)) {
        const field: EmbedField = {
          name: `\u200b`,
          value: trigger.lines.join("\n"),
          inline: false,
        };
        fields.push(field);
        return false;
      }
      return true;
    });
  });
  return fields;
};
