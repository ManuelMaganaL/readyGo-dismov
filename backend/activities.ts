import { supabase } from "@/backend/supabase";

// ACTIVITIES
export const fetchUserActivitiesById = async (id: string) => {
  const { data, error } = await supabase.schema("public").from("activities").select("*").eq("user_id", id);
  
  if (error || !data) {
    console.error('Error fetching user activities:', error);
    return null;
  }

  // Retorna una lista de actividades de supabase
  // [{id: string, user_id: string, name: string, created_at: string}, ...]
  return data;
};

export const fetchActivityById = async (id: string) => {
  const { data, error } = await supabase.schema("public").from("activities").select("*").eq("id", id).single();

  if (error || !data) {
    console.error('Error fetching activity:', error);
    return null;
  }

  // Retorna una actividad de supabase
  // {id: string, user_id: string, name: string, created_at: string}
  return data;
}

export const deleteActivity = async (id: string) => {
  const { data, error } = await supabase.schema("public").from("activities").delete().eq("id", id);

  if (error) {
    console.error('Error deleting activity:', error);
    return null;
  } else {
    return true;
  }
}

export const addActivity = async (userId: string, name: string) => {
  const { data, error } = await supabase.schema("public").from("activities").insert({
    user_id: userId,
    name,
  }).select("*").single();

  if (error || !data) {
    console.error('Error adding activity:', error);
    return null;
  }

  // Retorna la actividad creada
  // {id: string, user_id: string, name: string, created_at: string}
  return data;
}

// CHECKBOXES
export const fetchCheckboxesByActivityId = async (activityId: string) => {
  const { data, error } = await supabase.schema("public").from("checkboxes").select("*").eq("activity_id", activityId);

  if (error || !data) {
    console.error('Error fetching checkboxes:', error);
    return null;
  }

  // Retorna una lista de checkboxes de supabase
  // [{id: number, activity_id: number, description: string, created_at: string}, ...]
  return data;
}

export const addCheckboxToActivity = async (activityId: string, description: string) => {
  const { data, error } = await supabase.schema("public").from("checkboxes").insert({
    activity_id: activityId,
    description,
  }).select("*").single();

  if (error || !data) {
    console.error('Error adding checkbox:', error);
    return null;
  }

  // Retorna el checkbox creado
  // {id: number, activity_id: number, description: string, created_at: string}
  return data;
}

export const deleteCheckbox = async (checkboxId: string) => {
  const { data, error } = await supabase.schema("public").from("checkboxes").delete().eq("id", checkboxId).select("*").single();

  if (error || !data) {
    console.error('Error deleting checkbox:', error);
    return null;
  }

  // Retorna el checkbox eliminado
  // {id: number, activity_id: number, description: string, created_at: string}
  return data;
}