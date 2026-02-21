import { supabase } from "@/backend/supabase";

// Obtiene la informacion del usuario y comprueba si tiene una sesion abierta o no
export const getUserInfo = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data || !data.user) return null;
  return data.user;
};

// Inicia sesion con email y password, devuelve un mensaje de error si no se pudo iniciar sesion
export const login = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return error.message;
};

// Cierra la sesion del usuario
export const singOut = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error);
    return false;
  }

  return true;
}