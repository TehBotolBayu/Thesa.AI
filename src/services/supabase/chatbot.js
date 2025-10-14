import { supabase } from "@/config/supabase";

// ✅ Create a new chatbot
export async function createChatbot(data) {
  const { data: result, error } = await supabase
    .from("chatbots")
    .insert([data])
    .select();

  if (error) throw new Error(error.message);
  return result[0];
}

// ✅ Get all chatbots
export async function getAllChatbots() {
  const { data, error } = await supabase
    .from("chatbots")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

// ✅ Get chatbot by ID
export async function getChatbotById(id) {
  const { data, error } = await supabase
    .from("chatbots")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ✅ Update chatbot
export async function updateChatbot(id, updates) {
  const { data, error } = await supabase
    .from("chatbots")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ✅ Delete chatbot
export async function deleteChatbot(id) {
  const { error } = await supabase.from("chatbots").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { success: true };
}
