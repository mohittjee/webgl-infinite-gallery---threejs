import App from '../components/App';

export default function Home() {
  return (
    <div className="h-screen overflow-y-hidden bg-black">
      <div className="flex flex-col items-center space-y-10 demo-1__gallery opacity-0 p-4">
        {[...Array(12)].map((_, index) => {
          const imgIndex = index + 1;
          return (
            <figure
              key={imgIndex}
              className="w-full max-w-[800px] demo-1__gallery__figure"
            >
              <img
                className="w-full h-auto object-cover demo-1__gallery__image rounded-lg"
                src={`/images/demo-1/${imgIndex}.jpg`}
                alt={`Gallery image ${imgIndex}`}
              />
            </figure>
          );
        })}
      </div>
      <App />
    </div>
  );
}
