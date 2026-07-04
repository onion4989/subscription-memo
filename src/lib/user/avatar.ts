export const GUEST_DISPLAY_NAME = "ゲスト";

export const AVATAR_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export type AvatarId = (typeof AVATAR_IDS)[number];

export function isAvatarId(value: number): value is AvatarId {
  return AVATAR_IDS.includes(value as AvatarId);
}

export function avatarImagePath(avatarId: number): string {
  return `/assets/avater/Avater_images_${avatarId}.jpg`;
}
