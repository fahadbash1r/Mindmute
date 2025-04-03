import { useEffect, useRef } from 'react';

function SpiralTracker({ thoughts }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw spiral of thoughts
    thoughts.forEach((thought, index) => {
      const angle = index * 0.5 * Math.PI;
      const radius = 50 + index * 30;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      // Draw node
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, 2 * Math.PI);
      ctx.fillStyle = '#646cff';
      ctx.fill();

      // Draw connection line
      if (index > 0) {
        const prevAngle = (index - 1) * 0.5 * Math.PI;
        const prevRadius = 50 + (index - 1) * 30;
        const prevX = centerX + prevRadius * Math.cos(prevAngle);
        const prevY = centerY + prevRadius * Math.sin(prevAngle);

        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#646cff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw thought text
      ctx.font = '12px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText(thought.slice(0, 20) + (thought.length > 20 ? '...' : ''), x, y);
    });
  }, [thoughts]);

  return (
    <div className="spiral-tracker">
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={600}
        className="spiral-canvas"
      />
    </div>
  );
}

export default SpiralTracker; 