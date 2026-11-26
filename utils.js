// Sayfadaki bütün betiklerin paylaştığı küçük yardımcılar.

const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

// Aramada büyük/küçük harf, şapka, noktalı/noktasız i ve kesme işareti farkını yok sayar:
// "Kur'an", "kuran" ve "KUR’ÂN" aynı sonucu verir.
const foldText = value => String(value ?? "").toLocaleLowerCase("tr").normalize("NFD")
  .replace(/\p{M}/gu, "").replace(/ı/g, "i").replace(/['’‘]/g, "");
