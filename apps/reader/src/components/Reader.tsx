import { useEffect, useRef, useState } from 'react'
import { useSnapshot } from 'valtio'
import { PhotoSlider } from 'react-photo-view'
import clsx from 'clsx'
import { useTilg } from '@flow/tilg'
import { useColorScheme } from '@flow/hooks'
import { useBackground } from '../hooks/useBackground'
import { useTypography } from '../hooks/useTypography'
import { ReaderPaneHeader } from './ReaderPaneHeader'
import { ReaderPaneFooter } from './ReaderPaneFooter'
import { TextSelectionMenu } from './TextSelectionMenu'
import { Annotations } from './Annotations'
import { isTouchScreen } from '../utils'
import type { Tab } from '../store'

interface BookPaneProps {
  tab: Tab
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>
}

function BookPane({ tab, onMouseDown }: BookPaneProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prevSize = useRef(0)
  const typography = useTypography(tab)
  const { dark } = useColorScheme()
  const [background] = useBackground()
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr')

  const { iframe, rendition, rendered, container } = useSnapshot(tab)

  useTilg()

  const [src, setSrc] = useState<string>()

  // الكشف عن اتجاه النص عند تحميل الكتاب
  useEffect(() => {
    if (rendition && rendition.book) {
      const metadata = rendition.book.package.metadata
      const language = metadata.language || 'en'
      const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'dv', 'ha', 'khw', 'ks', 'ku', 'ps', 'yi']
      const isRTL = rtlLanguages.some(rtlLang => 
        language.toLowerCase().startsWith(rtlLang)
      )
      
      setDirection(isRTL ? 'rtl' : 'ltr')
    }
  }, [rendition])

  useEffect(() => {
    if (!iframe) return

    const onLoad = () => {
      if (!iframe.contentWindow) return
      const { document } = iframe.contentWindow
      document.querySelectorAll('img').forEach((img) => {
        img.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          setSrc(img.src)
        })
      })
    }

    iframe.addEventListener('load', onLoad)
    return () => {
      iframe.removeEventListener('load', onLoad)
    }
  }, [iframe])

  useEffect(() => {
    if (!rendition) return

    const applyCustomStyle = () => {
      typography.applyCustomStyle()
    }

    const onRelocated = () => {
      applyCustomStyle()
    }

    const onResized = () => {
      applyCustomStyle()
    }

    const onRendered = () => {
      applyCustomStyle()
    }

    rendition.on('relocated', onRelocated)
    rendition.on('resized', onResized)
    rendition.on('rendered', onRendered)

    return () => {
      rendition.off('relocated', onRelocated)
      rendition.off('resized', onResized)
      rendition.off('rendered', onRendered)
    }
  }, [rendition, typography])

  // تطبيق اتجاه النص عند تغييره
  useEffect(() => {
    if (rendition) {
      rendition.direction(direction)
      typography.applyCustomStyle()
    }
  }, [direction, rendition, typography])

  // إضافة معالج لتغيير اتجاه النص
  const handleDirectionChange = (newDirection: 'ltr' | 'rtl') => {
    setDirection(newDirection)
  }

  return (
    <div className={clsx('flex h-full flex-col', mobile && 'py-[3vw]')} dir={direction}>
      <PhotoSlider
        images={[{ src, key: 0 }]}
        visible={!!src}
        onClose={() => setSrc(undefined)}
        maskOpacity={0.6}
        bannerVisible={false}
      />
      <ReaderPaneHeader tab={tab} />
      <div
        ref={ref}
        className={clsx('relative flex-1', isTouchScreen || 'h-0')}
        // `color-scheme: dark` will make iframe background white
        style={{ colorScheme: 'auto' }}
      >
        <DirectionToggle direction={direction} onChange={handleDirectionChange} />
        <div
          className={clsx(
            'absolute inset-0',
            // do not cover `sash`
            'z-20',
            rendered && 'hidden',
            background,
          )}
        />
        <TextSelectionMenu tab={tab} />
        <Annotations tab={tab} />
      </div>
      <ReaderPaneFooter tab={tab} />
    </div>
  )
}

interface DirectionToggleProps {
  direction: 'ltr' | 'rtl'
  onChange: (direction: 'ltr' | 'rtl') => void
}

const DirectionToggle: React.FC<DirectionToggleProps> = ({ direction, onChange }) => {
  return (
    <button 
      onClick={() => onChange(direction === 'rtl' ? 'ltr' : 'rtl')}
      className="direction-toggle p-1 rounded bg-primary text-white text-xs"
      style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 100 }}
    >
      {direction === 'rtl' ? 'LTR' : 'RTL'}
    </button>
  )
}

export default BookPane
