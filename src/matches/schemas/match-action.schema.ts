import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MatchActionDocument = HydratedDocument<MatchAction>;

export enum Action {
  LIKE = 'like',
  PASS = 'pass',
}

@Schema({ timestamps: true })
export class MatchAction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  fromUser!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  toUser!: Types.ObjectId;

  @Prop({ type: String, enum: Action, required: true })
  action!: Action;
}

export const MatchActionSchema = SchemaFactory.createForClass(MatchAction);

MatchActionSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });
