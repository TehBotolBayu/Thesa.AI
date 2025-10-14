import { supabase } from "@/config/supabase";

export class ChatbotKnowledgeService {
  // Create new knowledge entry
  static async createKnowledge(knowledgeData) {
    const { chatbot_id, content, title } = knowledgeData;
    
    const { data, error } = await supabase
      .from("chatbot_knowledge")
      .insert([
        {
          chatbot_id,
          content,
          title,
        },
      ])
      .select();

    if (error) {
      throw new Error(`Error creating knowledge: ${error.message}`);
    }

    return data[0];
  }

  // Get all knowledge entries for a specific chatbot
  static async getKnowledgeByChatbot(chatbotId, limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from("chatbot_knowledge")
      .select("*")
      .eq("chatbot_id", chatbotId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Error fetching knowledge: ${error.message}`);
    }

    return data;
  }

  // Get a specific knowledge entry by ID
  static async getKnowledgeById(id) {
    const { data, error } = await supabase
      .from("chatbot_knowledge")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Error fetching knowledge: ${error.message}`);
    }

    return data;
  }

  // Update a knowledge entry
  static async updateKnowledge(id, updates) {
    const { data, error } = await supabase
      .from("chatbot_knowledge")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) {
      throw new Error(`Error updating knowledge: ${error.message}`);
    }

    return data[0];
  }

  // Delete a knowledge entry
  static async deleteKnowledge(id) {
    const { error } = await supabase
      .from("chatbot_knowledge")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Error deleting knowledge: ${error.message}`);
    }

    return true;
  }

  // Delete all knowledge entries for a chatbot
  static async deleteKnowledgeByChatbot(chatbotId) {
    const { error } = await supabase
      .from("chatbot_knowledge")
      .delete()
      .eq("chatbot_id", chatbotId);

    if (error) {
      throw new Error(`Error deleting chatbot knowledge: ${error.message}`);
    }

    return true;
  }

  // Get knowledge count for a chatbot
  static async getKnowledgeCount(chatbotId) {
    const { count, error } = await supabase
      .from("chatbot_knowledge")
      .select("*", { count: "exact", head: true })
      .eq("chatbot_id", chatbotId);

    if (error) {
      throw new Error(`Error getting knowledge count: ${error.message}`);
    }

    return count;
  }

  // Search knowledge by content or title
  static async searchKnowledge(chatbotId, searchTerm, limit = 20) {
    const { data, error } = await supabase
      .from("chatbot_knowledge")
      .select("*")
      .eq("chatbot_id", chatbotId)
      .or(`content.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Error searching knowledge: ${error.message}`);
    }

    return data;
  }

  // Bulk create knowledge entries
  static async bulkCreateKnowledge(knowledgeArray) {
    const { data, error } = await supabase
      .from("chatbot_knowledge")
      .insert(knowledgeArray)
      .select();

    if (error) {
      throw new Error(`Error bulk creating knowledge: ${error.message}`);
    }

    return data;
  }

  // Get knowledge entries with pagination
  static async getKnowledgeWithPagination(chatbotId, page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    
    const { data, error, count } = await supabase
      .from("chatbot_knowledge")
      .select("*", { count: "exact" })
      .eq("chatbot_id", chatbotId)
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error(`Error fetching paginated knowledge: ${error.message}`);
    }

    return {
      data,
      totalCount: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: page,
      pageSize
    };
  }
}
