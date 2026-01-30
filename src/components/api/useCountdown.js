import { useEffect, useState } from "react"

export default function useCountdown(endTime) {
  const [timeLeft, setTimeLeft] = useState(endTime - Date.now() / 1000)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(endTime - Date.now() / 1000)
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime])

  return Math.max(timeLeft, 0)
}
