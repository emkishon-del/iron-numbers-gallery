import styles from './Gallery.module.css';
export const mockImages = Array.from({ length: 7 }).map((_, i) => ({
  id: i,
  url: `/pic/m${11+i}.jpg`,
  name:'',
  alt: `תמונה מספר ${i + 1}`,
}));