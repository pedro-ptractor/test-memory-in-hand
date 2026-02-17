import { HttpError } from './http-error.js';

export class NotFilesUploaded extends HttpError {
  constructor() {
    super('No files uploaded', 400);
  }
}

export class AlreadySubmittedPhotos extends HttpError {
  constructor() {
    super('You have already submitted photos this month', 409);
  }
}
