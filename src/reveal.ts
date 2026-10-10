export function wrapMessage(message: string, maxCharacters = 28): string[] {
  const lines: string[] = [];
  for (const paragraph of message.slice(0, 180).split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      if (line.length + word.length + 1 > maxCharacters && line) {
        lines.push(line);
        line = "";
      }
      line += (line ? " " : "") + word;
    }
    if (line) lines.push(line);
  }
  return lines.slice(0, 5);
}
export async function messageLayer(
  message: string,
  width: number,
  height: number,
) {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#173337";
  ctx.fillRect(0, 0, width, height);
  const glow = ctx.createRadialGradient(
    width * 0.68,
    height * 0.4,
    0,
    width * 0.68,
    height * 0.4,
    width * 0.6,
  );
  glow.addColorStop(0, "#ffb36b22");
  glow.addColorStop(1, "#ffb36b00");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  const size = Math.min(width * 0.075, height * 0.1),
    lines = wrapMessage(
      message || "You are here.\nThat is enough.",
      width / height < 1 ? 16 : 28,
    );
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${size}px "Instrument Serif", serif`;
  ctx.fillStyle = "#edf0ea";
  lines.forEach((line, i) =>
    ctx.fillText(
      line,
      width / 2,
      height / 2 + (i - (lines.length - 1) / 2) * size * 1.2,
      width * 0.82,
    ),
  );
  // Original seeded star pattern, bundled as code rather than a network asset.
  for (let i = 0; i < 36; i++) {
    const x = (((i * 73 + 19) % 997) / 997) * width,
      y = (((i * 191 + 53) % 991) / 991) * height;
    ctx.globalAlpha = 0.15 + (i % 4) * 0.06;
    ctx.beginPath();
    ctx.arc(x, y, 1 + (i % 2), 0, Math.PI * 2);
    ctx.fill();
  }
  return canvas;
}
export async function imageLayer(file: File, width: number, height: number) {
  if (
    !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
    file.size > 10 * 1024 * 1024
  )
    throw new Error("Choose a PNG, JPG or WebP under 10 MB.");
  const image = await createImageBitmap(file, {
    resizeWidth: 1600,
    resizeQuality: "high",
  });
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!,
    scale = Math.max(width / image.width, height / image.height);
  ctx.drawImage(
    image,
    (width - image.width * scale) / 2,
    (height - image.height * scale) / 2,
    image.width * scale,
    image.height * scale,
  );
  image.close();
  return canvas;
}
