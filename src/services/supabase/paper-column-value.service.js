import { supabase } from "@/config/supabase";

export class PaperColumnValueService {
  // Create a new conversation
  static async createPaperColumnValue(paperColumnValueData) {
    const { paper_id, column_id, chatbot_id, value } = paperColumnValueData;

    const { data, error } = await supabase
      .from("paper_column_value")
      .insert([
        {
          paper_id,
          column_id,
          chatbot_id,
          value,
        },
      ])
      .select();
    ``;

    if (error) {
      throw new Error(`Error creating conversation: ${error.message}`);
    }

    return data[0];
  }

  // Get all conversations for a specific chatbot
  static async getPaperColumnValuesBy(
    chatbotId = null,
    paperId = null,
    columnId = null,
    limit = null,
    offset = null
  ) {
    let query = supabase
      .from("paper_column_value")
      .select("*")
      .order("created_at", { ascending: false });

    if (chatbotId) {
      query = query.eq("chatbot_id", chatbotId);
    }
    if (paperId) {
      query = query.eq("paper_id", paperId);
    }
    if (columnId) {
      query = query.eq("column_id", columnId);
    }

    if(limit !== null && offset !== null) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching conversations: ${error.message}`);
    }

    return data;
  }

  // Get a specific conversation by ID
  static async getPaperColumnValueById(id) {
    const { data, error } = await supabase
      .from("paper_column_value")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Error fetching conversation: ${error.message}`);
    }

    return data;
  }

  // Update a conversation
  static async updatePaperColumnValue(id, updates) {
    const { data, error } = await supabase
      .from("paper_column_value")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) {
      throw new Error(`Error updating conversation: ${error.message}`);
    }

    return data[0];
  }

  // Delete a conversation
  static async deletePaperColumnValue(id) {
    const { error } = await supabase
      .from("paper_column_value")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Error deleting conversation: ${error.message}`);
    }

    return true;
  }

  // Delete all conversations for a chatbot
  static async deletePaperColumnValuesByChatbot(chatbotId) {
    const { error } = await supabase
      .from("paper_column_value")
      .delete()
      .eq("chatbot_id", chatbotId);

    if (error) {
      throw new Error(`Error deleting chatbot conversations: ${error.message}`);
    }

    return true;
  }

  // ⚡️ Bulk insert multiple rows
  static async bulkInsertPaperColumnValues(records = []) {

    
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error("bulkInsertPaperColumnValues requires a non-empty array");
    }

    const filteredRecord = records.map(record => ({
      paper_id: record.paper_id,
      column_id: record.column_id,
      chatbot_id: record.chatbot_id,
      value: record.value
    }));

    // Each record should include: paper_id, column_id, chatbot_id, value
    const { data, error } = await supabase
      .from("paper_column_value")
      .insert(filteredRecord)
      .select();

    if (error) {
      throw new Error(`Error during bulk insert: ${error.message}`);
    }

    return data;
  }
}
