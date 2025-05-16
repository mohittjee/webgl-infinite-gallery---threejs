import App from '../components/App';

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <div className="demo-1__gallery">
        {[...Array(12)].map((_, i) => (
          <figure key={i} className={`demo-1__gallery__figure figure-${i + 1}`}>
            <img
              className="demo-1__gallery__image"
              src={`/images/demo-1/${i + 1}.jpg`}
              alt={`Gallery image ${i + 1}`}
            />
          </figure>
        ))}
      </div>
      <App />
    </div>
  );
}