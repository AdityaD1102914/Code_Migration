import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class File extends Document {
  @Prop({ required: true, trim: true, maxlength: 255 })
  originalName: string;

  @Prop({ required: true, unique: true, trim: true })
  filename: string;

  @Prop({ required: true, trim: true })
  mimetype: string;

  @Prop({ required: true, min: 0 })
  size: number;

  @Prop({ required: true, trim: true })
  path: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploadedBy: Types.ObjectId;

  @Prop({ default: false })
  isPublic: boolean;

  @Prop([{ type: String, trim: true, lowercase: true }])
  tags: string[];

  @Prop({ trim: true, maxlength: 500 })
  description?: string;
}

export const FileSchema = SchemaFactory.createForClass(File);

// Indexes for better query performance
FileSchema.index({ uploadedBy: 1 });
FileSchema.index({ mimetype: 1 });
FileSchema.index({ isPublic: 1 });
FileSchema.index({ tags: 1 });
FileSchema.index({ createdAt: -1 });
FileSchema.index({ originalName: 'text', description: 'text' });

// Compound indexes
FileSchema.index({ uploadedBy: 1, isPublic: 1 });
FileSchema.index({ mimetype: 1, isPublic: 1 });

// Transform output
FileSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  },
});