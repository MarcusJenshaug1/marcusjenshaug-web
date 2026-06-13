'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { FiPlay, FiExternalLink } from 'react-icons/fi'
import { Visualizer } from '@/components/fx/Visualizer'
import { spotifyUrlToUri } from '@/lib/makkos'

type SpotifyController = {
  destroy: () => void
  addListener: (event: string, callback: (e: SpotifyPlaybackEvent) => void) => void
}

type SpotifyPlaybackEvent = {
  data: { isPaused: boolean; isBuffering: boolean; duration: number; position: number }
}

type SpotifyIFrameAPI = {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: string; height?: string },
    callback: (controller: SpotifyController) => void
  ) => void
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameAPI) => void
  }
}

export function Makkos({ spotifyUrl }: { spotifyUrl: string | null }) {
  const [activated, setActivated] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [positionMs, setPositionMs] = useState(0)
  const embedRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<SpotifyController | null>(null)

  const uri = spotifyUrl ? spotifyUrlToUri(spotifyUrl) : null

  const activate = useCallback(() => {
    if (activated || !uri) return
    setActivated(true)
  }, [activated, uri])

  useEffect(() => {
    if (!activated || !uri) return
    const el = embedRef.current
    if (!el) return

    window.onSpotifyIframeApiReady = (api) => {
      api.createController(el, { uri, width: '100%', height: '152' }, (controller) => {
        controllerRef.current = controller
        controller.addListener('playback_update', (e) => {
          setPlaying(!e.data.isPaused)
          setPositionMs(e.data.position)
        })
      })
    }

    const script = document.createElement('script')
    script.src = 'https://open.spotify.com/embed/iframe-api/v1'
    script.async = true
    document.body.appendChild(script)

    return () => {
      controllerRef.current?.destroy()
      controllerRef.current = null
      delete window.onSpotifyIframeApiReady
      script.remove()
    }
  }, [activated, uri])

  return (
    <div className="makkos">
      <div className="makkos-visual">
        <Visualizer playing={playing} positionMs={positionMs} />
        <span className="makkos-wordmark display" aria-hidden>
          MAKKOS
        </span>
      </div>
      <div className="makkos-body">
        <p className="makkos-text">
          Når jeg ikke bygger programvare, lager jeg musikk som Makkos. Samme
          byggetrang, annet medium.
        </p>
        <div className="makkos-actions">
          {uri && !activated && (
            <button type="button" className="btn-xl btn-xl-solid mono" onClick={activate} data-cursor="play">
              <FiPlay aria-hidden /> Spill av
            </button>
          )}
          {spotifyUrl && (
            <a
              href={spotifyUrl}
              target="_blank"
              rel="me noopener noreferrer"
              className="btn-xl mono"
            >
              Åpne i Spotify <FiExternalLink aria-hidden />
            </a>
          )}
        </div>
        {activated && (
          <div className="makkos-embed">
            <div ref={embedRef} />
          </div>
        )}
        <p className="makkos-status mono" aria-live="polite">
          {playing ? '▶ SPILLER NÅ — VISUALISERING AKTIV' : 'STANDBY'}
        </p>
      </div>
    </div>
  )
}
