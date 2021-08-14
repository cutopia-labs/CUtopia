import { AuthDirective } from './auth-directive';
import { range, stringLength } from '@profusion/apollo-validation-directives';

const directives = {
  auth: AuthDirective,
  range,
  stringLength
}

export default directives;
