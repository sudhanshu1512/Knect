import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Heart, Share2 } from 'lucide-react';
import { Button } from './ui/button';

const Explore = () => {
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRefs = useRef({});

  // Sample video IDs (replace with your backend API call)
  const sampleVideoIds = [
    'eBGIQ7ZuuiU',  // Rick Roll Meme Short
    'Un6KNWWrnXs',  // Cat Vibing Meme
    'dJ2vjxdWU7c',  // Why Are You Running Meme
    'Z8KpKHLWz6Y',  // Nyan Cat Short
    'QH2-TGUlwu4',  // Pop Cat Meme
    'rRPQs_x19NU',  // Wide Putin Walking
    'p3G5IXn0K7A',  // Coffin Dance Meme
    'YBS8rJvxnKo',  // Vibing Cat
    '_V2sBURgUBI',  // To Be Continued Meme
    'eZFT7odS-2I',  // This Is Fine Dog
    'on4IoQ2MQ7M',  // Shooting Stars Meme
    'dv13gl0a-FA',  // Deja Vu Initial D
    '5vRlJUXwkW4',  // Surprised Pikachu
    'cbhv3_V_Lkg',  // Dancing Polish Cow
    'hRBOnA0ak4w',  // Keyboard Cat
    'y6120QOlsfU',  // Darude Sandstorm Short
    'L_jWHffIx5E',  // All Star Meme
    'Ct6BUPvE2sM',  // Dramatic Chipmunk
    'Sagg08DrO5U',  // What Does The Fox Say Short
    'Br0XwlFtizA'   // Screaming Goat
  ];

  useEffect(() => {
    // TODO: Replace with actual API call
    setVideos(sampleVideoIds);
  }, []);

  const handleIntersection = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const video = entry.target;
        const index = parseInt(video.dataset.index);
        setCurrentVideoIndex(index);
        video.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      } else {
        const video = entry.target;
        video.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      }
    });
  };

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.7,
    };

    const observer = new IntersectionObserver(handleIntersection, options);

    Object.values(videoRefs.current).forEach((videoRef) => {
      if (videoRef) {
        observer.observe(videoRef);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [videos]);

  return (
    <div className="flex flex-col items-center min-h-100 bg-background p-4">
      <div className="md:w-[380px] w-[250px] h-[calc(100vh-80px)] overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
        {videos.map((videoId, index) => (
          <div
            key={videoId}
            className="relative h-full w-full snap-start snap-always bg-card rounded-lg shadow-lg mb-4"
          >
            <iframe
              ref={(el) => (videoRefs.current[index] = el)}
              data-index={index}
              width="380"
              height="677"
              src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=1&rel=0&showinfo=1&modestbranding=1&playsinline=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="w-full h-full rounded-lg"
            />
            <div className="absolute bottom-4 right-4 flex flex-col gap-4">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full hover:bg-accent"
              >
                <Heart className="h-6 w-6" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full hover:bg-accent"
              >
                <Share2 className="h-6 w-6" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore;
