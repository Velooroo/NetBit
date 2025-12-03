import React, { useEffect, useState } from 'react';

/**
 * SplineEmbed
 * - Показывает fallback image (заглушку) если:
 *   * sceneUrl не передан/пустой, или
 *   * props.forceFallback === true, или
 *   * устройство мобильное (window.innerWidth <= 768) и передан fallbackImage.
 * - Пытается динамически импортировать @splinetool/react-spline, но не падает если пакет не установлен.
 *
 * Props:
 * - sceneUrl?: string
 * - fallbackImage?: string
 * - className?: string
 * - forceFallback?: boolean  // принудительно показывать fallback
 * - iframeProps?: HTMLIFrameElement props
 */
interface SplineEmbedProps {
  sceneUrl?: string;
  fallbackImage?: string;
  className?: string;
  forceFallback?: boolean;
  iframeProps?: React.IframeHTMLAttributes<HTMLIFrameElement>;
}

const SplineEmbed: React.FC<SplineEmbedProps> = ({
  sceneUrl,
  fallbackImage,
  className = '',
  forceFallback = false,
  iframeProps,
}) => {
  const [SplineComponent, setSplineComponent] = useState<any | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    let mounted = true;
    import('@splinetool/react-spline')
      .then((mod) => {
        if (!mounted) return;
        // default export or named export
        const Comp = (mod && (mod.default || mod.Spline || mod));
        setSplineComponent(() => Comp);
      })
      .catch(() => {
        // Не установлен пакет — работаем через iframe fallback
        if (mounted) setSplineComponent(null);
      });
    return () => { mounted = false; };
  }, []);

  // Решение: показываем fallback если:
  // - forceFallback === true
  // - sceneUrl пустой / не задан
  // - на мобильном и есть fallbackImage
  const shouldShowFallback = forceFallback || !sceneUrl || (isMobile && !!fallbackImage);

  // Если нужно обязательно показать заглушку (fallback image), показываем её
  if (shouldShowFallback) {
    if (fallbackImage) {
      return (
        <div className={className} style={{ width: '100%', height: '100%' }}>
          <img
            src={fallbackImage}
            alt="3D scene fallback"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      );
    }
    // Если нет fallbackImage — показываем минимальную стилизованную заглушку
    return (
      <div
        className={className}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
          color: 'rgba(255,255,255,0.7)',
          fontSize: 14,
        }}
      >
        3D scene placeholder — добавь Spline scene URL или PNG fallback
      </div>
    );
  }

  // Если есть Spline react компонент и не мобильный — рендерим его
  if (SplineComponent && !isMobile) {
    // @ts-ignore
    return (
      <div className={className} style={{ width: '100%', height: '100%' }}>
        {/* @ts-ignore */}
        <SplineComponent scene={sceneUrl} />
      </div>
    );
  }

  // Иначе используем iframe embed (если sceneUrl указан)
  if (sceneUrl) {
    return (
      <div className={className} style={{ width: '100%', height: '100%' }}>
        <iframe
          title="Spline scene"
          src={sceneUrl}
          frameBorder={0}
          allow="fullscreen; autoplay"
          style={{ width: '100%', height: '100%', border: '0' }}
          {...iframeProps}
        />
      </div>
    );
  }

  // Финальная страховка (на всякий случай)
  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255,255,255,0.7)',
      }}
    >
      3D scene placeholder
    </div>
  );
};

export default SplineEmbed;
