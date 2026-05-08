import { supabase } from "@/backend/supabase";

// ACTIVITIES
export const fetchUserActivitiesById = async (id: string) => {
  const { data, error } = await supabase
    .schema("public")
    .from("activities")
    .select("*, checkboxes(*)")
    .eq("user_id", id);

  if (error || !data) {
    console.error('Error fetching user activities:', error);
    return null;
  }

  return data;
};

export const fetchActivityById = async (id: string) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("No authenticated user found");
    return null;
  }

  const { data, error } = await supabase
    .schema("public")
    .from("activities")
    .select("*, checkboxes(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    console.error('Error fetching activity:', error);
    return null;
  }

  return data;
}

export const deleteActivity = async (id: string) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("No authenticated user found");
    return null;
  }

  const { data, error } = await supabase
    .schema("public")
    .from("activities")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*");

  if (error) {
    console.error('Error deleting activity:', error);
    return null;
  }

  if (!data || data.length === 0) {
    console.error("No activity found with id:", id, "for user:", user.id);
    return null;
  }

  return true;
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
  return data;
}

export const updateActivityName = async (id: string, name: string) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("No authenticated user found");
    return null;
  }

  const { data, error } = await supabase
    .schema("public")
    .from("activities")
    .update({ name })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*");

  if (error) {
    console.error("Error updating activity name:", error);
    return null;
  }

  if (!data || data.length === 0) {
    console.error("No activity found with id:", id, "for user:", user.id);
    return null;
  }

  return data[0];
};

// CHECKBOXES
export const fetchCheckboxesByActivityId = async (activityId: string) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("No authenticated user found");
    return null;
  }

  const activityCheck = await supabase
    .schema("public")
    .from("activities")
    .select("id")
    .eq("id", activityId)
    .eq("user_id", user.id)
    .single();

  if (activityCheck.error || !activityCheck.data) {
    console.error("Activity not found or access denied");
    return null;
  }

  const { data, error } = await supabase
    .schema("public")
    .from("checkboxes")
    .select("*")
    .eq("activity_id", activityId);

  if (error || !data) {
    console.error('Error fetching checkboxes:', error);
    return null;
  }

  // Retorna una lista de checkboxes de supabase
  return data;
}

export const addCheckboxToActivity = async (activityId: string, description: string) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("No authenticated user found");
    return null;
  }

  const activityCheck = await supabase
    .schema("public")
    .from("activities")
    .select("id")
    .eq("id", activityId)
    .eq("user_id", user.id)
    .single();

  if (activityCheck.error || !activityCheck.data) {
    console.error("Activity not found or access denied");
    return null;
  }

  const { data, error } = await supabase
    .schema("public")
    .from("checkboxes")
    .insert({
      activity_id: activityId,
      description,
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error('Error adding checkbox:', error);
    return null;
  }

  // Retorna el checkbox creado
  return data;
}

export const updateCheckboxDescription = async (checkboxId: string, description: string) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("No authenticated user found");
    return null;
  }

  console.log("Updating checkbox with ID:", checkboxId, "Description:", description);

  const checkboxData = await supabase
    .schema("public")
    .from("checkboxes")
    .select("activity_id")
    .eq("id", checkboxId)
    .single();

  if (checkboxData.error || !checkboxData.data) {
    console.error("Checkbox not found. Error:", checkboxData.error, "CheckboxId:", checkboxId);
    return null;
  }

  const activityCheck = await supabase
    .schema("public")
    .from("activities")
    .select("id")
    .eq("id", checkboxData.data.activity_id)
    .eq("user_id", user.id)
    .single();

  if (activityCheck.error || !activityCheck.data) {
    console.error("Access denied: activity does not belong to user");
    return null;
  }

  const { data, error } = await supabase
    .schema("public")
    .from("checkboxes")
    .update({ description })
    .eq("id", checkboxId)
    .select("*");

  if (error) {
    console.error('Error updating checkbox description:', error);
    return null;
  }

  if (!data || data.length === 0) {
    console.error("Checkbox not found");
    return null;
  }

  return data[0];
};

export const deleteCheckbox = async (checkboxId: string) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("No authenticated user found");
    return null;
  }

  const checkboxData = await supabase
    .schema("public")
    .from("checkboxes")
    .select("activity_id")
    .eq("id", checkboxId)
    .single();

  if (checkboxData.error || !checkboxData.data) {
    console.error("Checkbox not found");
    return null;
  }

  const activityCheck = await supabase
    .schema("public")
    .from("activities")
    .select("id")
    .eq("id", checkboxData.data.activity_id)
    .eq("user_id", user.id)
    .single();

  if (activityCheck.error || !activityCheck.data) {
    console.error("Access denied: activity does not belong to user");
    return null;
  }

  const { data, error } = await supabase
    .schema("public")
    .from("checkboxes")
    .delete()
    .eq("id", checkboxId)
    .select("*");

  if (error) {
    console.error('Error deleting checkbox:', error);
    return null;
  }

  if (!data || data.length === 0) {
    console.error("Checkbox not found");
    return null;
  }

  // Retorna el checkbox eliminado
  return data[0];
}