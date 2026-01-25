/**
 * Avatar Generation and Management
 * 
 * Generates avatars using DiceBear and handles avatar URLs
 */

import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";

/**
 * Generate an avatar URL based on user ID or handle
 * Uses Avataaars style for consistent, friendly avatars
 */
export function generateAvatarUrl(seed: string): string {
  const avatar = createAvatar(avataaars, {
    seed: seed,
    size: 400,
    // Use consistent styling
    backgroundColor: ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"],
  });

  return avatar.toDataUri();
}

/**
 * Get avatar URL for a user
 * Returns uploaded avatar if exists, otherwise generates one
 */
export async function getUserAvatarUrl(
  userId: string,
  handle: string,
  avatarUrl: string | null,
  avatarSource: string | null
): Promise<string> {
  // If user has uploaded avatar, use it
  if (avatarSource === "uploaded" && avatarUrl) {
    return avatarUrl;
  }

  // Otherwise, generate based on user ID (consistent across sessions)
  return generateAvatarUrl(userId || handle);
}

/**
 * Generate avatar SVG data URI (for use in img src)
 */
export function generateAvatarDataUri(seed: string): string {
  return generateAvatarUrl(seed);
}
