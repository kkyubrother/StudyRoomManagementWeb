import { useEffect, useState } from "react";
import Images from "react-bootstrap/Image";

/**
 * @author https://dev.to/diraskreact/react-async-image-loading-lka
 * @author https://freefrontend.com/css-loaders/
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const AsyncImage = (props) => {
  const [loadedSrc, setLoadedSrc] = useState(null);
  useEffect(() => {
    setLoadedSrc(null);
    if (props.src) {
      const handleLoad = () => {
        setLoadedSrc(props.src);
      };
      const image = new Image();
      image.addEventListener("load", handleLoad);
      image.src = props.src;
      return () => {
        image.removeEventListener("load", handleLoad);
      };
    }
  }, [props.src]);
  if (loadedSrc === props.src) {
    return <Images {...props} />;
  }

  return (
    <div className="place-holding-box" {...props}>
      <div className="place-holding-container">
        <span className="place-holding-circle"></span>
        <span className="place-holding-circle"></span>
        <span className="place-holding-circle"></span>
        <span className="place-holding-circle"></span>
      </div>
    </div>
  );
};

export default AsyncImage;
