"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SeatSelectorProps {
  ticketClass: "economy" | "business" | "firstClass"
  onSeatSelect: (seat: string) => void
  selectedSeat?: string
}

export function SeatSelector({ ticketClass, onSeatSelect, selectedSeat }: SeatSelectorProps) {
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null)

  // Generate seat layout based on class
  const getRows = () => {
    switch (ticketClass) {
      case "firstClass":
        return { rows: 2, cols: ['A', 'B', 'C', 'D'], occupied: ['1A', '1C'] }
      case "business":
        return { rows: 4, cols: ['A', 'B', 'C', 'D', 'E', 'F'], occupied: ['3A', '3B', '4F', '2C'] }
      case "economy":
      default:
        return { rows: 10, cols: ['A', 'B', 'C', 'D', 'E', 'F'], occupied: ['5A', '5B', '6C', '7D', '8E', '9F', '10A', '10B'] }
    }
  }

  const { rows, cols, occupied } = getRows()

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-muted border" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-primary" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-muted-foreground/30" />
          <span>Occupied</span>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="flex flex-col items-center gap-2 p-4 bg-muted/30 rounded-lg">
        {/* Column headers */}
        <div className="flex gap-2 mb-2">
          <div className="w-8" />
          {cols.map((col, index) => (
            <div key={col} className="flex items-center">
              <div className="w-8 text-center text-sm font-medium text-muted-foreground">{col}</div>
              {/* Aisle indicator */}
              {index === Math.floor(cols.length / 2) - 1 && (
                <div className="w-4" />
              )}
            </div>
          ))}
        </div>

        {/* Rows */}
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="flex gap-2">
            <div className="w-8 flex items-center justify-center text-sm font-medium text-muted-foreground">
              {rowIndex + 1}
            </div>
            {cols.map((col, colIndex) => {
              const seatId = `${rowIndex + 1}${col}`
              const isOccupied = occupied.includes(seatId)
              const isSelected = selectedSeat === seatId
              const isHovered = hoveredSeat === seatId

              return (
                <div key={col} className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "h-8 w-8 text-xs",
                      isOccupied && "bg-muted-foreground/30 cursor-not-allowed hover:bg-muted-foreground/30",
                      isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                      isHovered && !isOccupied && !isSelected && "bg-primary/20"
                    )}
                    disabled={isOccupied}
                    onClick={() => onSeatSelect(seatId)}
                    onMouseEnter={() => setHoveredSeat(seatId)}
                    onMouseLeave={() => setHoveredSeat(null)}
                  >
                    {isSelected ? seatId : ""}
                  </Button>
                  {/* Aisle */}
                  {colIndex === Math.floor(cols.length / 2) - 1 && (
                    <div className="w-4" />
                  )}
                </div>
              )
            })}
          </div>
        ))}

        {/* Front indicator */}
        <div className="mt-4 text-xs text-muted-foreground">FRONT</div>
      </div>

      {selectedSeat && (
        <div className="text-center">
          <span className="text-sm text-muted-foreground">Selected seat: </span>
          <span className="font-semibold text-primary">{selectedSeat}</span>
        </div>
      )}
    </div>
  )
}
