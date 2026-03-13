import { supabase } from "@/backend/supabase";
import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";

// Obtiene la informacion del usuario (schema auth) y comprueba si tiene una sesion abierta o no
export const getSessionInfo = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data || !data.user) return null;
  return data.user;
};

// Obtiene informacion del usuario del schema (public.users)
export const getUserInfo = async (user_id: string) => {
  const { data, error } = await supabase.schema("public").from("users").select("*").eq("id", user_id).single();
  if (error || !data) {
    console.error('Error fetching user info:', error);
    return null;
  }
  return data;
}

// Inicia sesion con email y password, devuelve un mensaje de error si no se pudo iniciar sesion
export const login = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return error.message;
};

export const signUp = async (username: string, email: string, password: string) => {
  const { data: singUpData, error: singUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (singUpError) {
    const msg = singUpError.message.toLowerCase();
    if (msg.includes('already registered') || msg.includes('already exists')) {
      throw new Error('Este email ya está registrado.');
    }
    if (msg.includes('password') || msg.includes('weak')) {
      throw new Error('La contraseña no cumple los requisitos de seguridad.');
    }
    if (msg.includes('email') || msg.includes('invalid')) {
      throw new Error('El email no es válido.');
    }
    throw new Error(singUpError.message || 'Error al crear la cuenta.');
  }

  if (!singUpData?.user?.id) {
    throw new Error('No se pudo crear el usuario. Inténtalo de nuevo.');
  }

  const { data, error } = await supabase.schema("public").from("users").insert({
    id: singUpData.user.id,
    username,
    email,
    password,
  });

  if (error) {
    if (error.code === '23505') {
      throw new Error('El nombre de usuario ya está en uso.');
    }
    throw new Error(error.message || 'Error al guardar el perfil.');
  }
}

// Cierra la sesion del usuario
export const singOut = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error);
    return false;
  }

  return true;
}

// Cambiar nombre de usuario
export const updateUsername = async (user_id: string, newUsername: string) => {
  const trimmedUsername = newUsername.trim();

  if (!trimmedUsername) {
    throw new Error('El nombre de usuario no puede estar vacío.');
  }

  const { error: userError } = await supabase
    .schema("public")
    .from("users")
    .update({ username: trimmedUsername })
    .eq("id", user_id);
  
  if (userError) {
    if (userError.code === '23505') {
      throw new Error('El nombre de usuario ya está en uso.');
    }
    throw new Error(userError.message || 'Error al actualizar el nombre de usuario.');
  }

  return true;
}

// Cambiar contraseña
export const updatePassword = async(newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) {
    console.error(error);
    return null;
  } else {
    return data;
  }
}

const getFileExtension = (uri: string): string => {
  const sanitized = uri.split("?")[0];
  const parts = sanitized.split(".");
  const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "jpg";
  if (["jpg", "jpeg", "png", "webp", "heic"].includes(ext)) return ext;
  return "jpg";
};

const extractAvatarPathFromPublicUrl = (avatarUrl?: string | null): string | null => {
  if (!avatarUrl) return null;
  try {
    const marker = "/storage/v1/object/public/avatars/";
    const index = avatarUrl.indexOf(marker);
    if (index === -1) return null;
    const encodedPath = avatarUrl.substring(index + marker.length).split("?")[0];
    if (!encodedPath) return null;
    return decodeURIComponent(encodedPath);
  } catch {
    return null;
  }
};

export const uploadUserAvatar = async (
  user_id: string,
  localUri: string,
  previousAvatarUrl?: string | null
): Promise<string> => {
  const extension = getFileExtension(localUri);
  const path = `${user_id}/avatar-${Date.now()}.${extension}`;

  const base64File = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const fileArrayBuffer = decode(base64File);

  const { error: uploadError } = await supabase
    .storage
    .from("avatars")
    .upload(path, fileArrayBuffer, {
      cacheControl: "3600",
      upsert: true,
      contentType: `image/${extension === "jpg" ? "jpeg" : extension}`,
    });

  if (uploadError) {
    throw new Error(uploadError.message || "No se pudo subir la foto de perfil.");
  }

  const oldPath = extractAvatarPathFromPublicUrl(previousAvatarUrl);
  if (oldPath && oldPath !== path) {
    await supabase.storage.from("avatars").remove([oldPath]).catch(() => {});
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

  const { error: userError } = await supabase
    .schema("public")
    .from("users")
    .update({ avatar_url: publicUrl })
    .eq("id", user_id);

  if (userError) {
    throw new Error(userError.message || "No se pudo guardar la foto de perfil.");
  }

  return publicUrl;
}