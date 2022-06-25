import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type HotelsDocument = Hotel & Document;

@Schema({versionKey: false, strict: false})
export class Hotel {
}

export const HotelSchema = SchemaFactory.createForClass(Hotel);
