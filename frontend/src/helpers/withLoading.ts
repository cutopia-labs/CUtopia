import { viewStore } from '../store';
import { ERROR_VAL } from '../constants/errors';

function withLoading<T>(
  target: any,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<T>>
): TypedPropertyDescriptor<(...args: any[]) => Promise<T>> {
  const originalMethod = descriptor.value;

  if (originalMethod) {
    descriptor.value = async function (...args: any[]) {
      if (this.setLoading) {
        this.setLoading(true);
      }
      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } catch (e) {
        if (viewStore.handleError) {
          viewStore.handleError(e);
        }
        return ERROR_VAL;
      } finally {
        if (this.setLoading) {
          this.setLoading(false);
        }
      }
    };
  }

  return descriptor;
}

export default withLoading;
