import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LogDocument = HydratedDocument<Log>;

@Schema({ timestamps: true })
export class Log {
  @Prop({ required: true })
  message!: string;

  @Prop()
  stack!: string;

  @Prop()
  context!: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId!: Types.ObjectId;

  @Prop()
  path!: string;

  @Prop()
  method!: string;

  @Prop()
  statusCode!: number;

  @Prop({ type: Object })
  metadata!: Record<string, unknown>;
}

export const LogSchema = SchemaFactory.createForClass(Log);