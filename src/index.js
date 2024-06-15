import { extractor } from './translations.js';
import Cac from 'cac';

export function runCommand() {
    const cli = Cac();
    cli.command('untsl', 'Extract untranslated text')
        .option('-f, --file <path>', 'specify the file path')
        .option('-g, --function <path>', 'specify the file path')
        .action((params) => {
            let fns = [];
            if (params.fn) {
                fns = fns.concat(
                    Array.isArray(params.fn) ? params.fn : [params.fn]
                );
            }
            if (params.function) {
                fns = fns.concat(
                    Array.isArray(params.function)
                        ? params.function
                        : [params.function]
                );
            }
            extractor({
                srcDir: params.f || params.file,
                fns,
            });
        });
    cli.version(process.env.npm_package_version);
    cli.parse();
}
