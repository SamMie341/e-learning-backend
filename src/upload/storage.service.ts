import { Injectable, InternalServerErrorException } from "@nestjs/common";
import {createClient, SupabaseClient} from '@supabase/supabase-js';
import { extname } from "path";

@Injectable()
export class StorageService {
    private supabase:SupabaseClient;

    constructor(){
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPASBASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

        if(!supabaseUrl || !supabaseKey){
            throw new Error('Supabase URL or key is missing in environment variables.');
        }
        this.supabase = createClient(supabaseUrl,supabaseKey);
    }

    async uploadFile(file: Express.Multer.File, folder: string = 'general'){
        try{
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            const fileName = `${uniqueSuffix}${ext}`;
            const filePath = `${folder}/${fileName}`;

            const {data, error} = await this.supabase.storage
            .from('elearning-bucket')
            .upload(filePath, file.buffer,{
                contentType: file.mimetype,
                upsert: false,
            });

            if(error) {
                throw error;
            }

            const {data: publicUrlData} = this.supabase.storage
            .from('elearning-bucket')
            .getPublicUrl(filePath);

            return {
                url: publicUrlData.publicUrl,
                path: filePath,
            };
        } catch (error) {
            console.error('supabase upload error:', error);
            throw new InternalServerErrorException('can not upload file to supabase yet');
        }
    }
}