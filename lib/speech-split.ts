/** Server va brauzer bir xil bo'laklaydi — shunda oldindan tayyorlangan ovoz keshdan topiladi. */

/** Uzun matnni jumla chegarasida ~max belgilik bo'laklarga bo'lish (birinchi ovoz tezroq keladi) */
export function splitForSpeech(text: string, max = 300): string[] {
  const sentences = text.match(/[^.!?…]+[.!?…]*\s*/g) ?? [text];
  const out: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if (cur && (cur + s).length > max) {
      out.push(cur.trim());
      cur = "";
    }
    cur += s;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
