import { Pinecone } from "@pinecone-database/pinecone";
import { createClient } from "@supabase/supabase-js";

export const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || "",
});

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);