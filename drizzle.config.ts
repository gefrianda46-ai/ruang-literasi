import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Memerintahkan Drizzle untuk membaca dari file .env.local
config({ path: '.env.local' });

export default defineConfig({
  // PENTING: Ganti path di bawah ini jika lokasi file schema.ts Anda berbeda (misal: './db/schema.ts')
  schema: './lib/db/schema.ts', 
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});