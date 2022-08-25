import { join } from 'path';

import { loadFilesSync } from '@graphql-tools/load-files';

const types = loadFilesSync(join(__dirname, 'bundle.graphql'));

export default types;
