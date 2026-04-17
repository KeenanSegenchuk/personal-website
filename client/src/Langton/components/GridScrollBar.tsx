import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

type GridScrollBarProps = {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
};

const GridScrollBar: React.FC<GridScrollBarProps> = ({ scrollContainerRef }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbLeftRef = useRef(0);
  const thumbWidthRef = useRef(0);
  const [visible, setVisible] = useState(false);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScrollLeft = useRef(0);
  const thumbRef = useRef<HTMLDivElement>(null);

  const updateThumb = () => {
    const el = scrollContainerRef.current;
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!el || !track || !thumb) return;

    const { scrollWidth, clientWidth, scrollLeft } = el;
    if (scrollWidth <= clientWidth) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const trackWidth = track.clientWidth;
    const ratio = clientWidth / scrollWidth;
    const thumbWidth = Math.max(trackWidth * ratio, 30);
    const maxScrollLeft = scrollWidth - clientWidth;
    const thumbLeft = maxScrollLeft > 0
      ? (scrollLeft / maxScrollLeft) * (trackWidth - thumbWidth)
      : 0;

    thumbLeftRef.current = thumbLeft;
    thumbWidthRef.current = thumbWidth;
    thumb.style.left = `${thumbLeft}px`;
    thumb.style.width = `${thumbWidth}px`;
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateThumb, { passive: true });

    // Watch the container itself (viewport width changes, window resize)
    const roContainer = new ResizeObserver(updateThumb);
    roContainer.observe(el);

    // Watch the inner grid element so we update when columns/rows are added.
    // firstElementChild is the max-content grid div inside the scroll container.
    const roContent = new ResizeObserver(updateThumb);
    const innerGrid = el.firstElementChild;
    if (innerGrid) roContent.observe(innerGrid);

    updateThumb();
    return () => {
      el.removeEventListener("scroll", updateThumb);
      roContainer.disconnect();
      roContent.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const ro = new ResizeObserver(updateThumb);
    ro.observe(track);
    return () => ro.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleThumbMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartScrollLeft.current = scrollContainerRef.current?.scrollLeft ?? 0;
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !scrollContainerRef.current || !trackRef.current) return;
      const el = scrollContainerRef.current;
      const dx = e.clientX - dragStartX.current;
      const trackWidth = trackRef.current.clientWidth;
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      const scrollDelta = (dx / (trackWidth - thumbWidthRef.current)) * maxScrollLeft;
      el.scrollLeft = dragStartScrollLeft.current + scrollDelta;
    };
    const handleMouseUp = () => { isDragging.current = false; };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [scrollContainerRef]);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollContainerRef.current;
    const track = trackRef.current;
    if (!el || !track) return;
    const rect = track.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    // Don't jump if click was on the thumb
    const thumbLeft = thumbLeftRef.current;
    const thumbWidth = thumbWidthRef.current;
    if (clickX >= thumbLeft && clickX <= thumbLeft + thumbWidth) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    el.scrollLeft = (clickX / track.clientWidth) * maxScrollLeft;
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 16,
        background: "rgba(5, 20, 30, 0.70)",
        borderTop: "1px solid rgba(80, 185, 215, 0.25)",
        zIndex: 9999,
        padding: "3px 12px",
        boxSizing: "border-box",
      }}
    >
      <div
        ref={trackRef}
        style={{ position: "relative", height: "100%", cursor: "pointer" }}
        onClick={handleTrackClick}
      >
        <div
          ref={thumbRef}
          style={{
            position: "absolute",
            top: 0,
            height: "100%",
            background: "rgba(140, 210, 245, 0.55)",
            borderRadius: 6,
            cursor: "grab",
            userSelect: "none",
            transition: "background 0.15s ease",
          }}
          onMouseDown={handleThumbMouseDown}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(180, 230, 255, 0.80)"; }}
          onMouseLeave={e => {
            if (!isDragging.current) {
              (e.currentTarget as HTMLDivElement).style.background = "rgba(140, 210, 245, 0.55)";
            }
          }}
        />
      </div>
    </div>
  );
};

export default GridScrollBar;
