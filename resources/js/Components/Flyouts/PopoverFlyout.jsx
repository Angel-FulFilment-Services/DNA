import { useState, useRef, useEffect } from 'react';
import { useFloating, offset, arrow, autoUpdate, computePosition, flip, shift } from '@floating-ui/react-dom';
import './PopoverFlyoutStyles.css';

export default function PopoverFlyout({ placement = 'top', width = 'auto', className = '', style = {}, children, content }) {
  const [isOpen, setIsOpen] = useState(false);
  const referenceElement = useRef(null);
  const popperElement = useRef(null);
  const arrowElement = useRef(null);

  const { x, y, strategy, middlewareData, update } = useFloating({
    placement: placement,
    strategy: 'absolute',
    middleware: [offset(5), arrow({ element: arrowElement }), flip()], // Increased offset value
  });

  useEffect(() => {
    if (isOpen) {
      const cleanup = autoUpdate(referenceElement.current, popperElement.current, () => {
        computePosition(referenceElement.current, popperElement.current, {
          placement: placement,
          middleware: [offset(5), flip(), arrow({ element: arrowElement.current }), shift({padding: 5})],
        }).then(({x, y, placement, middlewareData}) => {
          Object.assign(popperElement.current.style, {
            left: `${x}px`,
            top: `${y}px`,
          });

          const {x: arrowX, y: arrowY} = middlewareData.arrow;
 
          const staticSide = {
            top: 'bottom',
            right: 'left',
            bottom: 'top',
            left: 'right',
          }[placement.split('-')[0]];
         
          Object.assign(arrowElement.current.style, {
            left: arrowX != null ? `${arrowX}px` : '',
            top: arrowY != null ? `${arrowY}px` : '',
            right: '',
            bottom: '',
            [staticSide]: '-4px',
          });
        });
      });
      
      return () => cleanup();
    }
  }, [isOpen, update]);

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
          style={{
            position: strategy,
            top: y ?? '',
            left: x ?? '',
          }}
          className={`bg-white rounded-lg shadow-lg text-sm leading-6 ring-1 ring-gray-900/5 isolate ${width}`}
        >
          {content}
          <div ref={arrowElement} className="arrow" />
        </div>
      )}
    </div>
  );
}