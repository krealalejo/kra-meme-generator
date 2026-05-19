import { useState, useRef, useEffect, useCallback } from 'react'
import { gsap } from 'gsap'
import Header from './components/Header'
import DropZone from './components/DropZone'
import Stage from './components/Stage'
import SidePanel from './components/SidePanel'
import GenOverlay from './components/GenOverlay'
import { mkText } from './utils/text'
import { renderToBlob, triggerDownload } from './utils/canvas'

export default function App() {
  const [image, setImage] = useState(null)
  const [texts, setTexts] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [toast, setToast] = useState(null)

  const stageRef = useRef(null)
  const fileInputRef = useRef(null)

  const selected = texts.find((t) => t.id === selectedId)

  const loadImageSrc = useCallback((src) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setImage({ src, w: img.naturalWidth, h: img.naturalHeight })
      setTexts([
        mkText({ text: 'TOP TEXT', y: 0.08 }),
        mkText({ text: 'BOTTOM TEXT', y: 0.86 }),
      ])
      setSelectedId(null)
    }
    img.onerror = () => setToast("couldn't load that image")
    img.src = src
  }, [])

  const handleFile = useCallback((file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setToast("that's not an image, friend")
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => loadImageSrc(e.target.result)
    reader.readAsDataURL(file)
  }, [loadImageSrc])

  useEffect(() => {
    const onDragOver = (e) => e.preventDefault()
    const onDrop = (e) => {
      e.preventDefault()
      const file = e.dataTransfer.files?.[0]
      if (file) handleFile(file)
    }
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('drop', onDrop)
    }
  }, [handleFile])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(t)
  }, [toast])

  const addText = () => {
    if (!image) { setToast('upload an image first'); return }
    const t = mkText({ text: 'NEW TEXT', y: 0.45 + Math.random() * 0.1 })
    setTexts((prev) => [...prev, t])
    setSelectedId(t.id)
  }

  const updateText = (id, patch) =>
    setTexts((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))

  const removeText = (id) => {
    setTexts((prev) => prev.filter((t) => t.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const duplicateText = (id) => {
    const t = texts.find((x) => x.id === id)
    if (!t) return
    const copy = { ...t, id: crypto.randomUUID(), y: Math.min(0.95, t.y + 0.06) }
    setTexts((prev) => [...prev, copy])
    setSelectedId(copy.id)
  }

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
      const blob = await renderToBlob(image, texts)
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

  return (
    <div className="app">
      <Header
        hasImage={!!image}
        onUpload={() => fileInputRef.current?.click()}
        onDownload={handleDownload}
        generating={generating}
      />

      <main className="main">
        <section className="stage-wrap">
          {!image ? (
            <DropZone
              onPickFile={() => fileInputRef.current?.click()}
              onSample={(src) => loadImageSrc(src)}
            />
          ) : (
            <Stage
              ref={stageRef}
              image={image}
              texts={texts}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              updateText={updateText}
            />
          )}
        </section>

        <aside className="side">
          <SidePanel
            image={image}
            texts={texts}
            selected={selected}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            addText={addText}
            updateText={updateText}
            removeText={removeText}
            duplicateText={duplicateText}
            onReplaceImage={() => fileInputRef.current?.click()}
            onClearImage={() => { setImage(null); setTexts([]); setSelectedId(null) }}
          />
        </aside>
      </main>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <GenOverlay />

      {toast && <div className="toast mono">{toast}</div>}
    </div>
  )
}
