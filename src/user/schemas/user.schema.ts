import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type UserDocument = HydratedDocument<User>;
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ min: 18 })
  age!: number;

  @Prop({ type: String, enum: Gender })
  gender!: Gender;

  @Prop({ trim: true, lowercase: true })
  city!: string;

  @Prop({ type: [String] })
  interests!: string[];

  @Prop({ type: String })
  photoUrl!: string | null;

  @Prop({ type: String, enum: Gender })
  preferredGender!: Gender | null;

  @Prop()
  preferredAgeMin!: number;

  @Prop()
  preferredAgeMax!: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
