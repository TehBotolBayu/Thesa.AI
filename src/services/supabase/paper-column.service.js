import { supabase } from "@/config/supabase";

export class PaperColumnService {
  // Create a new conversation
  static async createPaperColumn(paperColumnData) {
    const { chatbot_id, label, instruction } = paperColumnData;
    
    const { data, error } = await supabase
      .from("paper_column")
      .insert([
        {
          chatbot_id,
          label,
          instruction,
        },
      ])
      .select();

    if (error) {
      throw new Error(`Error creating conversation: ${error.message}`);
    }

    return data[0];
  }

  // Get all conversations for a specific chatbot
  static async getPaperColumnsByChatbot(chatbotId, limit = 50, offset = 0) {
    console.log("hit get service");
    console.log("chatbotId", chatbotId);
    const { data, error } = await supabase
      .from("paper_column")
      .select("*")
      .eq("chatbot_id", chatbotId)
      .order("created_at", { ascending: true })

    if (error) {
      throw new Error(`Error fetching conversations: ${error.message}`);
    }

    console.log("data response data", JSON.stringify(data, null, 2));

    return data;
  }


  // Get a specific conversation by ID
  static async getPaperColumnById(id) {
    const { data, error } = await supabase
      .from("paper_column")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Error fetching conversation: ${error.message}`);
    }

    return data;
  }

  // Update a conversation
  static async updatePaperColumn(id, updates) {
    const { data, error } = await supabase
      .from("paper_column")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) {
      throw new Error(`Error updating conversation: ${error.message}`);
    }

    return data[0];
  }

  // Delete a conversation
  static async deletePaperColumn(id) {
    const { error } = await supabase
      .from("paper_column")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Error deleting conversation: ${error.message}`);
    }

    return true;
  }

  // Delete all conversations for a chatbot
  static async deletePaperColumnsByChatbot(chatbotId) {
    const { error } = await supabase
      .from("paper_column")
      .delete()
      .eq("chatbot_id", chatbotId);

    if (error) {
      throw new Error(`Error deleting chatbot conversations: ${error.message}`);
    }

    return true;
  }
 
}
