import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type GitInstalledAppDocument = InstalledApp & Document;

@Schema({ timestamps: true })
export class InstalledApp {
    @Prop()
    userId: string;
    @Prop()
    installationId: string;
    @Prop({ type: Object, required: false })
    githubToken?: Object
    @Prop({ type: Object, required: false })
    reposData?: Object
    // permissions: {
    //     contents: string;
    //     metadata: string;
    // }
}

export const InstalledAppSchema = SchemaFactory.createForClass(InstalledApp);