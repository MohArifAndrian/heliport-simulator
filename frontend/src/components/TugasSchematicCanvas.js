"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { renderTugasSchematicToCanvas } from "@/lib/tugasSchematicDraw";

const TugasSchematicCanvas = forwardRef(function TugasSchematicCanvas({ answers = null }, ref) {
  const canvasRef = useRef(null);

  useImperativeHandle(ref, () => ({
    captureSnapshot: (snapshotAnswers = answers) =>
      renderTugasSchematicToCanvas(canvasRef.current, snapshotAnswers),
  }));

  useEffect(() => {
    renderTugasSchematicToCanvas(canvasRef.current, answers);
  }, [answers]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      renderTugasSchematicToCanvas(canvas, answers);
    });
    ro.observe(canvas.parentElement ?? canvas);
    return () => ro.disconnect();
  }, [answers]);

  return (
    <canvas
      ref={canvasRef}
      className="mx-auto block max-w-full"
      aria-label="Diagram tugas helipad dengan label huruf A–O"
    />
  );
});

export default TugasSchematicCanvas;
