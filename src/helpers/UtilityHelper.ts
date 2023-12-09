import { BaseHelper } from "../interfaces/BaseHelper";

interface ParsedArgs {
    [key: string]: string | boolean;
}

export class UtilityHelper implements BaseHelper {
    
    initialize(): void {
        console.log('Utility Helper initialized');
    }

    parseArgs(args: string[]): ParsedArgs {
        const parsedArgs: ParsedArgs = {};
        for (let i = 0; i < args.length; i++) {
            if (args[i].startsWith('--')) {
                const key = args[i].slice(2);
                if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
                    parsedArgs[key] = args[i + 1];
                    i++;
                } else {
                    parsedArgs[key] = true;
                }
            }
        }
        return parsedArgs;
    }
    
}