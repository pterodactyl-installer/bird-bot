"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkLog = void 0;
const triggers_1 = require("../config/triggers");
const checkLog = async function (log, triggerSet) {
    if (log == 'Empty')
        return [];
    let fields = [];
    let triggers;
    switch (triggerSet) {
        case 'panel':
            triggers = triggers_1.panelTriggers;
            break;
        case 'wings':
            triggers = triggers_1.wingsTriggers;
            break;
        case 'nginx':
            triggers = triggers_1.nginxTriggers;
            break;
        case 'other':
            triggers = triggers_1.otherTriggers;
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
exports.checkLog = checkLog;
