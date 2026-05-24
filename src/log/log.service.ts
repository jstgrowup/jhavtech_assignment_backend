import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log, LogDocument } from './schemas/log.schema';

@Injectable()
export class LogService {
  constructor(@InjectModel(Log.name) private logModel: Model<LogDocument>) {}

  async createLog(logData: {
    message: string;
    stack?: string;
    context?: string;
    userId?: string;
    path?: string;
    method?: string;
    statusCode?: number;
    metadata?: Record<string, unknown>;
  }): Promise<Log> {
    const log = new this.logModel(logData);
    return log.save();
  }
}
