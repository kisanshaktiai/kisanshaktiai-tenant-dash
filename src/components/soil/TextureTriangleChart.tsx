interface TextureTriangleChartProps {
  sand: number | null;
  silt: number | null;
  clay: number | null;
}

export function TextureTriangleChart({ sand, silt, clay }: TextureTriangleChartProps) {
  if (!sand || !silt || !clay) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No texture data available
      </div>
    );
  }

  // Calculate position on triangle
  const height = 200;
  const width = 230;
  
  // Convert percentages to triangle coordinates
  const x = width / 2 + (sand - silt) * (width / 200);
  const y = height - (clay * height / 100);

  return (
    <div className="relative">
      <svg viewBox="0 0 230 200" className="w-full h-full">
        {/* Triangle outline */}
        <polygon
          points="115,10 10,190 220,190"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="2"
        />
        
        {/* Grid lines */}
        <line x1="10" y1="190" x2="115" y2="10" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.3" />
        <line x1="220" y1="190" x2="115" y2="10" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.3" />
        <line x1="10" y1="190" x2="220" y2="190" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.3" />
        
        {/* Background texture regions (simplified) */}
        <polygon points="115,10 60,100 170,100" fill="hsl(var(--primary))" opacity="0.05" />
        <polygon points="60,100 10,190 115,190" fill="hsl(var(--secondary))" opacity="0.05" />
        <polygon points="170,100 115,190 220,190" fill="hsl(var(--accent))" opacity="0.05" />
        
        {/* Sample point */}
        <circle
          cx={x}
          cy={y}
          r="6"
          fill="hsl(var(--primary))"
          stroke="hsl(var(--background))"
          strokeWidth="2"
        />
        
        {/* Labels */}
        <text x="115" y="25" textAnchor="middle" className="text-xs fill-current">
          Clay
        </text>
        <text x="5" y="200" textAnchor="start" className="text-xs fill-current">
          Sand
        </text>
        <text x="225" y="200" textAnchor="end" className="text-xs fill-current">
          Silt
        </text>
      </svg>
      
      {/* Legend */}
      <div className="mt-2 text-xs text-center text-muted-foreground">
        <div className="grid grid-cols-3 gap-2">
          <div>Sand: {sand.toFixed(1)}%</div>
          <div>Silt: {silt.toFixed(1)}%</div>
          <div>Clay: {clay.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
}
