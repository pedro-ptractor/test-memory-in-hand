import { HttpError } from './http-error.js';

export class PhotoLimitExceeded extends HttpError {
  constructor() {
    super('Photo limit exceeded', 400);
  }
}
