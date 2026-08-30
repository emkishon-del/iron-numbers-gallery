export const mockImages = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i + 1),
  url: `https://picsum.photos/seed/iron-number-${i + 1}/800/600`,
  name: i % 3 === 0 ? `מספר ברזל ${i + 1}` : '',
  alt: `תמונה מספר ${i + 1}`,
}));