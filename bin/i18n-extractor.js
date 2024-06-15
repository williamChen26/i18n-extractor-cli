#!/usr/bin/env node

import { runCommand } from '../src/index.js';

runCommand();

// export { extractor } from '../src/translations.js';
// import Cac from 'cac';

// const cli = Cac();
// cli.command('untsl', 'Extract untranslated text')
//     .option('-f, --file <path>', 'specify the file path')
//     .action((params) => {
//         console.log('params: ', params);
//         extractor({ srcDir: params.f || params.file });
//     });
// cli.version(process.env.npm_package_version);
