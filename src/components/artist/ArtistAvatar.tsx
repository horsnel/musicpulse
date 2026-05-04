'use client'

import { useState } from 'react'

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#642b73,#c6426e)',
  'linear-gradient(135deg,#1a1a2e,#16213e)',
  'linear-gradient(135deg,#134e5e,#71b280)',
  'linear-gradient(135deg,#4b1248,#f10711)',
  'linear-gradient(135deg,#2d1b69,#11998e)',
  'linear-gradient(135deg,#1a4a6e,#2196f3)',
  'linear-gradient(135deg,#c94b4b,#4b134f)',
  'linear-gradient(135deg,#0f2027,#2c5364)',
]

interface Props {
  name: string
  imageUrl?: string
  index: number
}

export function ArtistAvatar({ name, imageUrl, index }: Props) {
  const [imgError, setImgError] = useState(false)
  const gradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length]
  const initials = name
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div
      className="w-[90px] h-[90px] sm:w-[140px] sm:h-[140px] rounded-full flex items-center justify-center text-[22px] sm:text-[30px] font-extrabold text-white/90 transition-transform duration-300 group-hover:scale-105 mx-auto overflow-hidden"
      style={{ background: gradient }}
    >
      {imageUrl && !imgError ? (
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        initials
      )}
    </div>
  )
}
