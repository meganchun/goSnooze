import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { apiPublicUrl, apiQuery, apiUpload } from "./apiManager";
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
  const row = await apiQuery<ProfileRow | null>((c) =>
    c.from("profiles").select("*").eq("id", userId).maybeSingle<ProfileRow>()
  );
  return row ? toProfile(row) : null;
}

export async function saveProfile(profile: Profile): Promise<Profile> {
  const row = await apiQuery<ProfileRow>((c) =>
    c
      .from("profiles")
      .upsert({
        id: profile.id,
        first_name: profile.firstName,
        last_name: profile.lastName,
        profile_picture_url: profile.profilePicture || null,
        onboarding_completed: profile.onboardingCompleted,
      })
      .select()
      .single<ProfileRow>()
  );
  return { ...toProfile(row), email: profile.email, phone: profile.phone };
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
  await apiUpload("profile-images", path, decode(base64), {
    contentType,
    upsert: true,
  });
  return apiPublicUrl("profile-images", path);
}
