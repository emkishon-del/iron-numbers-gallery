import GalleryImage from './GalleryImage';

export default function GridView({ images = [] }) {
  if (images.length === 0) return null;

  return (
    <div className="ing-grid" dir="rtl">
      {images.map((image) => (
        <GalleryImage key={image.id} image={image} size="grid" />
      ))}
    </div>
  );
}