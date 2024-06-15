import { extractor } from './translations.js';
import Cac from 'cac';

export function runCommand() {
    const cli = Cac();
    cli.command('untsl', 'Extract untranslated text')
        .option('-f, --file <path>', 'specify the file path')
        .option('-fns, --functions <path>', 'An array of function names')
        .action((params) => {
            extractor({
                srcDir: params.f || params.file,
                fns: params.fns || params.functions,
            });
        });
    cli.version(process.env.npm_package_version);
    cli.parse();
}
