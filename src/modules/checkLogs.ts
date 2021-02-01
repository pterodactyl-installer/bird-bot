import { EmbedField } from 'discord.js';
import {
    nginxTriggers,
    otherTriggers,
    panelTriggers,
    wingsTriggers,
} from '../config/triggers';

export const checkLog = async function (
    log: string,
    triggerSet: string
): Promise<EmbedField[]> {
    if (log == 'Empty') return [];
    let fields: EmbedField[] = [];
    let triggers;
    switch (triggerSet) {
        case 'panel':
            triggers = panelTriggers;
            break;
        case 'wings':
            triggers = wingsTriggers;
            break;
        case 'nginx':
            triggers = nginxTriggers;
            break;
        case 'other':
            triggers = otherTriggers;
        default:
            return [];
    }
    triggers.forEach((trigger) => {
        for (let i = 0; i < trigger.keys.length; i++) {
            const key = trigger.keys[i];
            if (log.includes(key)) {
                fields.push({
                    name: `Problem: ${triggerSet}`,
                    value: trigger.lines.join('\n'),
                    inline: false,
                });
                break;
            }
        }
    });
    return fields;
};
