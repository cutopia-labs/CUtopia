import { loadFilesSync } from '@graphql-tools/load-files';
import { join } from 'path';

const types = loadFilesSync(join(__dirname, 'bundle.graphql'));

export default types;
