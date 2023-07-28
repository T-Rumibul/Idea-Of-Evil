import 'module-alias/register';
import {addAliases} from 'module-alias';

addAliases({
  '@bot': `${__dirname}/bot`,
  '@api': `${__dirname}/api`,
  '@src': `${__dirname}`,
});
