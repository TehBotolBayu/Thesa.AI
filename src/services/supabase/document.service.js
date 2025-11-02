import { supabase } from "@/config/supabase";

export class DocumentService {
  // Create a new conversation
  static async createDocument(documentData) {
    const { chatbot_id, content, type } = documentData;
    const { data, error } = await supabase
    .from("doc_data")
    .insert([{ chatbot_id, content, type }])
    .select()
    .single();

    if (error) {
      throw new Error(`Error creating conversation: ${error.message}`);
    }

    return data;
  }

  // Get all conversations for a specific chatbot
  static async getDocumentsByChatbot(chatbotId, limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from("doc_data")
      .select("*")
      .eq("chatbot_id", chatbotId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Error fetching conversations: ${error.message}`);
    }

    console.log('document data: ', JSON.stringify(data, null, 2));
    return data;
  }

  // Get a specific conversation by ID
  static async getDocumentById(id) {
    const { data, error } = await supabase
      .from("doc_data")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Error fetching document: ${error.message}`);
    }

    return data;
  }

  // Update a conversation
  static async updateDocument(id, updates) {
    const { content, type } = updates;
    const { data, error } = await supabase
      .from("doc_data")
      .update({ content, type })
      .eq("id", id)
      .select();

    if (error) {
      throw new Error(`Error updating document: ${error.message}`);
    }

    return data[0];
  }

  // Delete a conversation
  static async deleteDocument(id) {
    const { error } = await supabase
      .from("doc_data")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Error deleting document: ${error.message}`);
    }

    return true;
  }

  // Delete all conversations for a chatbot
  static async deleteDocumentsByChatbot(chatbotId) {
    const { error } = await supabase
      .from("doc_data")
      .delete()
      .eq("chatbot_id", chatbotId);

    if (error) {
      throw new Error(`Error deleting chatbot documents: ${error.message}`);
    }

    return true;
  }

}
