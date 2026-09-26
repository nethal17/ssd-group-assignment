import pino from 'pino';

export const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  },
  redact: {
    paths: [
      'STRIPE_SECRET_KEY',
      'password',
      'token',
      'req.headers.authorization',
      'body.driverId',
      'body.totalSalary',
      'body.driverName',
      'currency',
      'amount'
    ],
    remove: false,
    censor: '[REDACTED]'
  }
});
