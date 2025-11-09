import { createClient } from "@/lib/supabase/client";

const TABLE_NAME = "review_criteria";

export const ReviewCriteriaService = {
  // 🟢 Create
  async create(req, chatbot_id) {
    const criteria = {
      research_question: req.researchQuestion,
      keywords: req.keywords,
      inclusion_criteria: req.inclusionCriteria,
      exclusion_criteria: req.exclusionCriteria,
      chatbot_id
    } 

    const { data, error } = await createClient()
      .from(TABLE_NAME)
      .insert(criteria)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // 🔵 Read (get all)
  async getAll(chatbot_id) {
    let query = createClient()
    .from(TABLE_NAME)
    .select("*")
    .single();

    if (chatbot_id) query = query.eq("chatbot_id", chatbot_id);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    
    
    
    
    return data;
  },

  // 🔵 Read (get by ID)
  async getById(id) {
    const { data, error } = await createClient()
      .from(TABLE_NAME)
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async getByChatbotId(chatbot_id) {
    const { data, error } = await createClient()
      .from(TABLE_NAME)
      .select("*")
      .eq("chatbot_id", chatbot_id)
      .limit(1);

    if (error) throw new Error(error.message);
    return data;
  },

  // 🟠 Update
  async update(id, req) {
    const criteria = {
      research_question: req.researchQuestion,
      keywords: req.keywords,
      inclusion_criteria: req.inclusionCriteria,
      exclusion_criteria: req.exclusionCriteria,
    } 
    const { data, error } = await createClient()
      .from(TABLE_NAME)
      .update(criteria)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // 🔴 Delete
  async remove(id) {
    const { error } = await createClient().from(TABLE_NAME).delete().eq("id", id);
    if (error) throw new Error(error.message);
    return true;
  },
};
