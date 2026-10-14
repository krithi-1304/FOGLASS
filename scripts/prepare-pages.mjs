import {mkdir,copyFile,rm} from 'node:fs/promises';
await mkdir('dist/lab',{recursive:true});
await copyFile('dist/index.html','dist/lab/index.html');
// Local user notes are not part of the hosted application.
await rm('dist/models/MASTER_PROMPT.md',{force:true});
