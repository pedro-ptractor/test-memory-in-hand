import { HttpError } from './http-error.js';

export class NotFoundSubscription extends HttpError {
  constructor() {
    super('Subscription not found', 404);
  }
}
