import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

export function SetupFeatureImage() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  let imageSrc: string | null = null
  if (mounted && resolvedTheme) {
    imageSrc = resolvedTheme === 'dark' ? '/images/arcane_dark.png' : '/images/arcane_light.png'
  }

  return (
    <div className="w-1/2 flex items-center justify-center h-full">
      <div className="text-white w-full max-w-2xl text-center flex items-center justify-center h-full">
        <div className="relative overflow-hidden">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="Data Analytics Dashboard"
              className="rounded-lg max-w-[500px] max-h-[500px] object-contain mx-auto"
            />
          ) : (
            <div className="rounded-lg max-w-[500px] max-h-[500px] mx-auto bg-transparent" />
          )}
        </div>
      </div>
    </div>
  )
}
