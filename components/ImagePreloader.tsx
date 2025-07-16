import React from 'react';
import { createPortal } from 'react-dom';

interface ImagePreloaderProps {
  urls: string[];
}

/**
 * A component that preloads images by injecting <link rel="preload"> tags into the document head.
 * It does not render any visible elements in the component tree.
 */
const ImagePreloader: React.FC<ImagePreloaderProps> = ({ urls }) => {
  // Preloading is a browser-only optimization, so we do nothing on the server.
  if (typeof window === 'undefined') {
    return null;
  }

  // We use a portal to render the <link> tags directly into the document's <head>.
  return createPortal(
    <>
      {urls.map((url) => (
        <link key={url} rel="preload" as="image" href={url} fetchPriority="low" />
      ))}
    </>,
    document.head
  );
};

export default ImagePreloader;
