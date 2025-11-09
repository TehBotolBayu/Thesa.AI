import { supabase } from "@/config/supabase";

export class PaperColumnService {
  // Create a new column
  static async createColumn(columnData) {
    const { chatbotId, label, instruction, step } = columnData;
    
    const { data, error } = await supabase
      .from("paper_column")
      .insert([
        {
          chatbot_id: chatbotId,
          label,
          instruction,
          step,
        },
      ])
      .select();

    if (error) {
      throw new Error(`Error creating column: ${error.message}`);
    }

    return data[0];
  }

  // Get columns by chatbot ID
  static async getColumnsByChatbotId(chatbotId) {
    const { data, error } = await supabase
      .from("paper_column")
      .select("*")
      .eq("chatbot_id", chatbotId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Error fetching columns: ${error.message}`);
    }

    return data;
  }

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
    
    
    const { data, error } = await supabase
      .from("paper_column")
      .select("*")
      .eq("chatbot_id", chatbotId)
      .order("created_at", { ascending: true })

    if (error) {
      throw new Error(`Error fetching conversations: ${error.message}`);
    }

    

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

   // 🟢 Bulk insert columns
   static async bulkInsertColumns(columns) {
    if (!Array.isArray(columns) || columns.length === 0) {
      throw new Error("Input must be a non-empty array of column objects");
    }

    const formattedColumns = columns.map((col) => ({
      chatbot_id: col.chatbot_id || col.chatbotId,
      label: col.label,
      instruction: col.instruction,
      step: col.step,
    }));

    const { data, error } = await supabase
      .from("paper_column")
      .insert(formattedColumns)
      .select();

    if (error) {
      throw new Error(`Error bulk inserting columns: ${error.message}`);
    }

    return data;
  }
 
}
