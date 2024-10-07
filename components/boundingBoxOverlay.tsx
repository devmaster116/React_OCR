import React, { useEffect, useRef, useState } from 'react'

interface BoundingBox {
  text: string
  boundingBox: { x: number; y: number }[]
}

interface Props {
  boundingBoxes: BoundingBox[]
  imageWidth: number
  imageHeight: number
  containerWidth: number
  containerHeight: number
}

export const BoundingBoxOverlay: React.FC<Props> = ({
  boundingBoxes,
  imageWidth,
  imageHeight,
  containerWidth,
  containerHeight
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (svgRef.current) {
      const scaleX = containerWidth / imageWidth
      const scaleY = containerHeight / imageHeight
      const newScale = Math.min(scaleX, scaleY)
      setScale(newScale)
    }
  }, [imageWidth, imageHeight, containerWidth, containerHeight])

  const svgWidth = imageWidth * scale
  const svgHeight = imageHeight * scale

  return (
    <svg
      ref={svgRef}
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${imageWidth} ${imageHeight}`}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {boundingBoxes.map((box, index) => (
        <rect
          key={index}
          x={Math.min(...box.boundingBox.map(v => v.x))}
          y={Math.min(...box.boundingBox.map(v => v.y))}
          width={Math.max(...box.boundingBox.map(v => v.x)) - Math.min(...box.boundingBox.map(v => v.x))}
          height={Math.max(...box.boundingBox.map(v => v.y)) - Math.min(...box.boundingBox.map(v => v.y))}
          fill="none"
          stroke="red"
          strokeWidth={2 / scale}
        />
      ))}
    </svg>
  )
}