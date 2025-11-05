// Time in milliseconds
export const TIME_MS = {
  ONE_SECOND: 1000,
  ONE_MINUTE: 60 * 1000,
  FIFTEEN_MINUTES: 15 * 60 * 1000,
};

// Time in seconds
export const TIME_S = {
  FIVE_MINUTES: 5 * 60,
  FIFTEEN_MINUTES: 15 * 60,
  ONE_HOUR: 60 * 60,
  ONE_DAY: 24 * 60 * 60,
};

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const HTTP_STATUS = {
  OK: 200,
  NO_CONTENT: 204,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_REQUEST: 400,
  CONFLICT: 409,
};

export const HTTP_LABEL = {
  OK: 'OK',
  NOT_FOUND: 'Not Found',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  BAD_REQUEST: 'Bad Request',
  CONFLICT: 'Conflict',
};
