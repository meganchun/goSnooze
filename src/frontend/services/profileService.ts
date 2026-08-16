import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { supabase } from "@/src/backend/supabase";
import { User } from "../types/userTypes";

export type Profile = User & { onboardingCompleted: boolean };

type ProfileRow = {
  id: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string | null;
  onboarding_completed: boolean;
};

const toProfile = (row: ProfileRow): Profile => ({
  id: row.id,
  email: "",
  phone: "",
  firstName: row.first_name,
  lastName: row.last_name,
  profilePicture: row.profile_picture_url ?? "",
  onboardingCompleted: row.onboarding_completed,
});

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle<ProfileRow>();

  if (error) throw error;
  return data ? toProfile(data) : null;
}

export async function saveProfile(profile: Profile): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: profile.id,
      first_name: profile.firstName,
      last_name: profile.lastName,
      profile_picture_url: profile.profilePicture || null,
      onboarding_completed: profile.onboardingCompleted,
    })
    .select()
    .single<ProfileRow>();

  if (error) throw error;
  return { ...toProfile(data), email: profile.email, phone: profile.phone };
}

export async function uploadProfileImage(
  userId: string,
  imageUri: string
): Promise<string> {
  const extension = imageUri.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/avatar.${extension}`;
  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const contentType = extension === "png" ? "image/png" : "image/jpeg";
  const { error } = await supabase.storage
    .from("profile-images")
    .upload(path, decode(base64), { contentType, upsert: true });

  if (error) throw error;
  return supabase.storage.from("profile-images").getPublicUrl(path).data.publicUrl;
}
