import { supabase } from "@/lib/supabase";

export const getUserInfo = async () => {
  const { data, error } = await supabase.auth.getUser();
  
  if (error || !data || !data.user) {
    console.error('Error fetching user info:', error);
    return null;
  }

  return data.user;
};