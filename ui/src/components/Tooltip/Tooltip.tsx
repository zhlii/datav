import { css, cx } from '@emotion/css';
import React, { useState, HTMLAttributes, useMemo, useRef, useLayoutEffect } from 'react';
import useWindowSize from 'react-use/lib/useWindowSize';



import { calculateTooltipPosition } from './utils';

/**
 * @public
 */
export interface TooltipContainerProps extends HTMLAttributes<HTMLDivElement> {
  position: { x: number; y: number };
  offset: { x: number; y: number };
  children?: React.ReactNode;
  allowPointerEvents?: boolean;
}

/**
 * @public
 */
export const TooltipContainer: React.FC<TooltipContainerProps> = ({
  position: { x: positionX, y: positionY },
  offset: { x: offsetX, y: offsetY },
  children,
  allowPointerEvents = false,
  className,
  ...otherProps
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipMeasurement, setTooltipMeasurement] = useState({ width: 0, height: 0 });
  const { width, height } = useWindowSize();

  const [placement, setPlacement] = useState({
    x: positionX + offsetX,
    y: positionY + offsetY,
  });

  const resizeObserver = useMemo(
    () =>
      // TS has hard time playing games with @types/resize-observer-browser, hence the ignore
      // @ts-ignore
      new ResizeObserver((entries) => {
        for (let entry of entries) {
          const tW = Math.floor(entry.contentRect.width + 2 * 8); //  adding padding until Safari supports borderBoxSize
          const tH = Math.floor(entry.contentRect.height + 2 * 8);
          if (tooltipMeasurement.width !== tW || tooltipMeasurement.height !== tH) {
            setTooltipMeasurement({
              width: Math.min(tW, width),
              height: Math.min(tH, height),
            });
          }
        }
      }),
    [tooltipMeasurement, width, height]
  );

  useLayoutEffect(() => {
    if (tooltipRef.current) {
      resizeObserver.observe(tooltipRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [resizeObserver, tooltipRef]);

  // Make sure tooltip does not overflow window
  useLayoutEffect(() => {
    if (tooltipRef && tooltipRef.current) {
      let { x, y } = calculateTooltipPosition(
        positionX,
        positionY,
        tooltipMeasurement.width,
        tooltipMeasurement.height,
        offsetX,
        offsetY,
        width,
        height
      );
      //@todo
      // for some unkown reasons, x is a bit smaller than the actual value
      x = x + 40
      setPlacement({ x, y });
    }
  }, [width, height, positionX, offsetX, positionY, offsetY, tooltipMeasurement]);



  return (
    <div
      ref={tooltipRef}
      style={{
        position: 'fixed',
        left: 0,
        // disabling pointer-events is to prevent the tooltip from flickering when moving left to right
        // see e.g. https://github.com/grafana/grafana/pull/33609
        pointerEvents: allowPointerEvents ? 'auto' : 'none',
        top: 0,
        transform: `translate(${placement.x}px, ${placement.y}px)`,
        transition: 'transform ease-out 0.1s',
        zIndex: 1001,
        // maxWidth: '800px'
        overflow: "hidden"
      }}
      {...otherProps}
    >
      {children}
    </div>
  );
};

TooltipContainer.displayName = 'VizTooltipContainer';
