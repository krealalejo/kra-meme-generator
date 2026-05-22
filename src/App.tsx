import { useState, useRef, useEffect, useCallback } from 'react'
import { gsap } from 'gsap'
import Header from './components/Header'
import DropZone from './components/DropZone'
import Stage from './components/Stage'
import SidePanel from './components/SidePanel'
import GenOverlay from './components/GenOverlay'
import MobileSheetHeader from './components/MobileSheetHeader'
import MobileFab from './components/MobileFab'
import useIsMobile from './hooks/useIsMobile'
import { mkText, mkImageLayer } from './utils/text'
import { renderToBlob, triggerDownload } from './utils/canvas'

export default function App() {
  const [image, setImage] = useState(null)
  const [layers, setLayers] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [toast, setToast] = useState(null)
  const [theme, setTheme] = useState(() => localStorage.getItem('mf-theme') || (globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
  const [mobileTab, setMobileTab] = useState('layers')
  const [sheetOpen, setSheetOpen] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    const splash = document.querySelector('.splash')
    if (splash) splash.remove()
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('mf-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  const stageRef = useRef(null)
  const stageWrapRef = useRef(null)
  const sideRef = useRef(null)
  const fileInputRef = useRef(null)
  const overlayInputRef = useRef(null)

  const selected = layers.find((l) => l.id === selectedId)

  const selectLayer = useCallback((id) => {
    setSelectedId(id)
    if (isMobile && id) {
      setMobileTab('edit')
      setSheetOpen(true)
    }
  }, [isMobile])

  const animateSidePanel = useCallback(() => {
    if (!sideRef.current) return
    const w = Number(gsap.getProperty(sideRef.current, 'width'))
    if (w !== 0) return
    gsap.fromTo(sideRef.current, { width: 0 }, {
      width: 360, duration: 0.38, ease: 'power3.out',
      onComplete: () => { if (sideRef.current) sideRef.current.style.overflowY = 'auto' },
    })
  }, [])

  const loadImageSrc = useCallback((src) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const swap = () => {
        setImage({ src, w: img.naturalWidth, h: img.naturalHeight })
        setLayers([
          mkText({ text: 'TOP TEXT', y: 0.08 }),
          mkText({ text: 'BOTTOM TEXT', y: 0.86 }),
        ])
        setSelectedId(null)
        gsap.set(stageWrapRef.current, { clearProps: 'opacity,scale' })
        animateSidePanel()
      }
      if (stageWrapRef.current) {
        gsap.to(stageWrapRef.current, {
          opacity: 0, scale: 0.97, duration: 0.15, ease: 'power2.in',
          onComplete: swap,
        })
      } else {
        swap()
      }
    }
    img.onerror = () => setToast("couldn't load that image")
    img.src = src
  }, [animateSidePanel])

  const addImageLayer = useCallback((src) => {
    if (!image) { setToast('upload an image first'); return }
    const img = new Image()
    img.onload = () => {
      const aspectRatio = img.naturalWidth / img.naturalHeight
      const layer = mkImageLayer({ src, x: 0.5, y: 0.5, w: 0.35, aspectRatio })
      setLayers((prev) => [...prev, layer])
      selectLayer(layer.id)
    }
    img.src = src
  }, [image, selectLayer])

  const readFileAsDataURL = useCallback((file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  }), [])

  const handleFile = useCallback((file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setToast("that's not an image, friend")
      return
    }
    readFileAsDataURL(file).then(loadImageSrc)
  }, [loadImageSrc, readFileAsDataURL])

  const handleOverlayFile = useCallback((file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setToast("that's not an image, friend")
      return
    }
    readFileAsDataURL(file).then(addImageLayer)
  }, [addImageLayer, readFileAsDataURL])

  useEffect(() => {
    const onDragOver = (e) => e.preventDefault()
    const onDrop = (e) => {
      e.preventDefault()
      const file = e.dataTransfer.files?.[0]
      if (file) handleFile(file)
    }
    globalThis.addEventListener('dragover', onDragOver)
    globalThis.addEventListener('drop', onDrop)
    return () => {
      globalThis.removeEventListener('dragover', onDragOver)
      globalThis.removeEventListener('drop', onDrop)
    }
  }, [handleFile])

  useEffect(() => {
    const onPaste = (e) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            if (image) {
              handleOverlayFile(file)
            } else {
              handleFile(file)
            }
          }
          break
        }
      }
    }
    globalThis.addEventListener('paste', onPaste)
    return () => globalThis.removeEventListener('paste', onPaste)
  }, [image, handleFile, handleOverlayFile])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(t)
  }, [toast])

  const addText = useCallback(() => {
    if (!image) { setToast('upload an image first'); return }
    const t = mkText({ text: 'NEW TEXT', y: 0.45 + Math.random() * 0.1 })
    setLayers((prev) => [...prev, t])
    selectLayer(t.id)
  }, [image, selectLayer])

  const updateLayer = useCallback((id, patch) =>
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l))), [])

  const removeLayer = useCallback((id) => {
    setLayers((prev) => prev.filter((l) => l.id !== id))
    setSelectedId((sel) => sel === id ? null : sel)
  }, [])

  const reorderLayers = useCallback((fromIdx, toIdx) => {
    if (fromIdx === toIdx) return
    setLayers((prev) => {
      const next = [...prev]
      const [moved] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, moved)
      return next
    })
  }, [])

  const clearImage = useCallback(() => {
    gsap.to(stageWrapRef.current, {
      opacity: 0, scale: 0.97, duration: 0.15, ease: 'power2.in',
      onComplete: () => {
        gsap.set(stageWrapRef.current, { clearProps: 'opacity,scale' })
        setImage(null); setLayers([]); setSelectedId(null)
        if (sideRef.current) {
          sideRef.current.style.overflowY = 'hidden'
          gsap.to(sideRef.current, { width: 0, duration: 0.22, ease: 'power2.in' })
        }
      },
    })
  }, [])

  const duplicateLayer = useCallback((id) => {
    const newId = crypto.randomUUID()
    setLayers((prev) => {
      const l = prev.find((x) => x.id === id)
      if (!l) return prev
      return [...prev, { ...l, id: newId, y: Math.min(0.95, l.y + 0.06) }]
    })
    selectLayer(newId)
  }, [selectLayer])

  const handleDownload = async () => {
    if (!image || generating) return
    setSelectedId(null)
    setGenerating(true)

    const overlay = document.getElementById('gen-overlay')
    const stage = stageRef.current

    const tl = gsap.timeline()
    tl.to(stage, {
      keyframes: [
        { x: -6, y: 2, rotate: -0.6, duration: 0.07 },
        { x: 7, y: -3, rotate: 0.7, duration: 0.07 },
        { x: -4, y: 3, rotate: -0.4, duration: 0.07 },
        { x: 0, y: 0, rotate: 0, duration: 0.07 },
      ],
    })
    tl.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }, 0)
    tl.fromTo(
      '#gen-overlay .stamp',
      { scale: 0, rotate: -30, opacity: 0 },
      { scale: 1, rotate: (i) => (i % 2 ? 8 : -8), opacity: 1, duration: 0.45, stagger: 0.08, ease: 'back.out(2.2)' },
      0.05
    )
    tl.fromTo('#gen-overlay .bar', { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power2.inOut' }, 0.1)
    tl.fromTo(
      '#gen-overlay .glitch',
      { x: -8 },
      { x: 8, duration: 0.08, repeat: 8, yoyo: true, ease: 'none' },
      0.1
    )

    await new Promise((r) => setTimeout(r, 900))

    try {
      const blob = await renderToBlob(image, layers)
      triggerDownload(blob, `meme-${Date.now()}.png`)
      gsap.to('#gen-overlay .done', {
        keyframes: [
          { scale: 0, rotate: -25, opacity: 0, duration: 0 },
          { scale: 1.3, rotate: 8, opacity: 1, duration: 0.22, ease: 'back.out(3)' },
          { scale: 1, rotate: -4, duration: 0.18 },
        ],
      })
      await new Promise((r) => setTimeout(r, 700))
    } catch (err) {
      console.error(err)
      setToast('export failed — try a smaller image')
    }

    await gsap.to(overlay, { autoAlpha: 0, duration: 0.25 })
    gsap.set('#gen-overlay .stamp, #gen-overlay .done', { clearProps: 'all' })
    setGenerating(false)
  }

  const appClass = ['app', isMobile && 'is-mobile', isMobile && sheetOpen && 'sheet-open', isMobile && !image && 'no-image'].filter(Boolean).join(' ')

  return (
    <div className={appClass}>
      <Header
        hasImage={!!image}
        onUpload={() => fileInputRef.current?.click()}
        onDownload={handleDownload}
        generating={generating}
        theme={theme}
        onToggleTheme={toggleTheme}
        isMobile={isMobile}
      />

      <main className="main">
        <section className="stage-wrap" ref={stageWrapRef}>
          {image ? (
            <Stage
              ref={stageRef}
              image={image}
              layers={layers}
              selectedId={selectedId}
              setSelectedId={selectLayer}
              updateLayer={updateLayer}
            />
          ) : (
            <DropZone
              onPickFile={() => fileInputRef.current?.click()}
              onSample={(src) => loadImageSrc(src)}
            />
          )}
        </section>

        <aside className="side" ref={sideRef}>
          {isMobile && (
            <MobileSheetHeader
              tab={mobileTab}
              setTab={setMobileTab}
              open={sheetOpen}
              setOpen={setSheetOpen}
              counts={{ layers: layers.length, hasImage: !!image, hasSel: !!selected }}
            />
          )}
          <SidePanel
            image={image}
            layers={layers}
            selected={selected}
            selectedId={selectedId}
            setSelectedId={selectLayer}
            addText={addText}
            addImageLayer={() => {
              if (!image) { setToast('upload an image first'); return }
              overlayInputRef.current?.click()
            }}
            updateLayer={updateLayer}
            removeLayer={removeLayer}
            duplicateLayer={duplicateLayer}
            reorderLayers={reorderLayers}
            onReplaceImage={() => fileInputRef.current?.click()}
            onClearImage={clearImage}
            isMobile={isMobile}
            mobileTab={mobileTab}
          />
        </aside>
      </main>

      {isMobile && image && (
        <MobileFab generating={generating} onDownload={handleDownload} />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = '' }}
      />
      <input
        ref={overlayInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => { handleOverlayFile(e.target.files?.[0]); e.target.value = '' }}
      />

      <GenOverlay />

      {toast && <div className="toast mono">{toast}</div>}
    </div>
  )
}
