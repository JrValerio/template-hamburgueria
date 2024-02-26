import { useEffect } from "react";


export const useEscapePress = (onClose) => {
  useEffect(() => {
    const handleEscapePress = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscapePress);
    return () => {
      document.removeEventListener("keydown", handleEscapePress);
    };
  }, [onClose]);
};

export const useOutsideClick = (ref, onClose) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, onClose]);
};