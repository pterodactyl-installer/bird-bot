import Enmap from 'enmap';
import fs from 'fs';
import reader from 'readline-sync';
import { defaultSettings } from './modules/functions';

let baseConfig = fs.readFileSync(`${__dirname}/../config.js.example`, 'utf8');

const settings = new Enmap({
    name: 'settings',
    cloneLevel: 'deep',
    ensureProps: true,
});

(async function () {
    if (fs.existsSync(`${__dirname}/config/config.js`)) {
        console.log('Already been set up!');
        process.exit(0);
    }
    console.log('Setting Up Configuration...');
    await settings.defer;

    console.log(
        'First Start! Inserting default guild settings in the database...'
    );
    settings.set('default', defaultSettings);

    console.log('Enter your discord API token: ');
    const TOKEN = reader.question('');
    console.log('Enter the internal API port: ');
    const INTERNALPORT = reader.question('');
    console.log('Enter the external (alias) (can be the same) API port: ');
    const ALIASPORT = reader.question('');
    console.log(
        'Enter the FQDN of API (https://api.api.com)(http://454.789.456.456): '
    );
    const URL = reader.question('');
    console.log('Enter the support Message title (embed title): ');
    const TITLE = reader.question('');
    console.log('Enter the support Message description (embed description): ');
    const DESCRIPTION = reader.question('');

    baseConfig = baseConfig.replace('TOKEN', `${TOKEN}`);
    baseConfig = baseConfig.replace('INTERNALPORT', `${INTERNALPORT}`);
    baseConfig = baseConfig.replace('ALIASPORT', `${ALIASPORT}`);
    baseConfig = baseConfig.replace('URL', `${URL}`);
    baseConfig = baseConfig.replace('TITLE', `${TITLE}`);
    baseConfig = baseConfig.replace('DESCRIPTION', `${DESCRIPTION}`);

    fs.writeFileSync(`${__dirname}/config/config.js`, baseConfig);
    console.log('REMEMBER TO NEVER SHARE YOUR TOKEN WITH ANYONE!');
    console.log('Configuration has been written, enjoy!');
    await settings.close();
})();
