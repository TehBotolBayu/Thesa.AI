import { supabase } from "@/config/supabase";

export class ChatbotConversationService {
  // Create a new conversation
  static async createConversation(conversationData) {
    const { chatbot_id, message, sender, session_id } = conversationData;
    
    const { data, error } = await supabase
      .from("chatbot_conversations")
      .insert([
        {
          chatbot_id,
          message,
          sender,
          session_id,
        },
      ])
      .select();

    if (error) {
      throw new Error(`Error creating conversation: ${error.message}`);
    }

    return data[0];
  }

  // Get all conversations for a specific chatbot
  static async getConversationsByChatbot(chatbotId, limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from("chatbot_conversations")
      .select("*")
      .eq("chatbot_id", chatbotId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Error fetching conversations: ${error.message}`);
    }

    return data;
  }

  // Get conversations by session ID
  static async getConversationsBySession(sessionId, limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from("chatbot_conversations")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Error fetching session conversations: ${error.message}`);
    }

    return data;
  }

  // Get a specific conversation by ID
  static async getConversationById(id) {
    const { data, error } = await supabase
      .from("chatbot_conversations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Error fetching conversation: ${error.message}`);
    }

    return data;
  }

  // Update a conversation
  static async updateConversation(id, updates) {
    const { data, error } = await supabase
      .from("chatbot_conversations")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) {
      throw new Error(`Error updating conversation: ${error.message}`);
    }

    return data[0];
  }

  // Delete a conversation
  static async deleteConversation(id) {
    const { error } = await supabase
      .from("chatbot_conversations")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Error deleting conversation: ${error.message}`);
    }

    return true;
  }

  // Delete all conversations for a chatbot
  static async deleteConversationsByChatbot(chatbotId) {
    const { error } = await supabase
      .from("chatbot_conversations")
      .delete()
      .eq("chatbot_id", chatbotId);

    if (error) {
      throw new Error(`Error deleting chatbot conversations: ${error.message}`);
    }

    return true;
  }

  // Get conversation count for a chatbot
  static async getConversationCount(chatbotId) {
    const { count, error } = await supabase
      .from("chatbot_conversations")
      .select("*", { count: "exact", head: true })
      .eq("chatbot_id", chatbotId);

    if (error) {
      throw new Error(`Error getting conversation count: ${error.message}`);
    }

    return count;
  }

  // Search conversations by message content
  static async searchConversations(chatbotId, searchTerm, limit = 20) {
    const { data, error } = await supabase
      .from("chatbot_conversations")
      .select("*")
      .eq("chatbot_id", chatbotId)
      .ilike("message", `%${searchTerm}%`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Error searching conversations: ${error.message}`);
    }

    return data;
  }
}
