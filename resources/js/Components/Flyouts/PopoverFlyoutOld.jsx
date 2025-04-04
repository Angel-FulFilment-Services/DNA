import { useState, useRef, useEffect } from 'react';
import { createPopper } from '@popperjs/core';

export default function PopoverFlyout({ placement = 'top', width = 'auto', index, className = '', style = {}, children, content }) {
  const [isOpen, setIsOpen] = useState(false);
  const referenceElement = useRef(null);
  const popperElement = useRef(null);
  const arrowElement = useRef(null); // Add a ref for the arrow element
  const popperInstance = useRef(null);

  // Initialize or Update Popper.js
  const initializePopper = () => {
    if (referenceElement.current && popperElement.current) {
      if (popperInstance.current) {
        popperInstance.current.destroy(); // Destroy the existing instance
      }

      popperInstance.current = createPopper(referenceElement.current, popperElement.current, {
        placement, // Use the dynamic placement prop
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 5], // Adjust the offset (horizontal, vertical)
            },
          },
          {
            name: 'arrow',
            options: {
              element: arrowElement.current, // Use the arrow ref
            },
          },
        ],
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      initializePopper();
      if (popperElement.current) {
        popperElement.current.focus();
      }
    }

    return () => {
      if (popperInstance.current) {
        popperInstance.current.destroy();
        popperInstance.current = null;
      }
    };
  }, [isOpen, placement]); // Reinitialize Popper.js when `isOpen` or `placement` changes

  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  return (
    <div
      ref={referenceElement}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${className}`}
      style={style}
    >
      {/* Trigger Element */}
      {children}

      {/* Popover Content */}
      {isOpen && (
        <div
          ref={popperElement}
          className={`bg-white rounded-lg shadow-lg text-sm leading-6 ring-1 ring-gray-900/5 isolate ${width}`}
        >
          {content}
          <div ref={arrowElement} className="arrow" /> {/* Add the arrow element */}
        </div>
      )}
    </div>
  );
}