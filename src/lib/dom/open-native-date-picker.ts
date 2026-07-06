export function openNativeDatePicker(input: HTMLInputElement): void {
  if (typeof input.showPicker !== "function") {
    return;
  }

  try {
    input.showPicker();
  } catch {
    // 一部ブラウザではユーザー操作以外で showPicker が拒否される
  }
}
