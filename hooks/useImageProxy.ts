import { useState, useEffect } from 'react';
import type { Contributor } from '@/types';

export function useImageProxy(backgroundImage: string | undefined, contributors: Contributor[]) {
  const [proxyBackgroundUrl, setProxyBackgroundUrl] = useState<string | null>(null);
  const [proxiedAvatars, setProxiedAvatars] = useState<Record<number, string>>({});
  const [imageStatus, setImageStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // Background Proxy Effect
  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    const proxyBackground = async () => {
      if (!backgroundImage) {
        if (active) setProxyBackgroundUrl(null);
        return;
      }
      if (backgroundImage.startsWith('/') || backgroundImage.startsWith('data:') || backgroundImage.startsWith('blob:')) {
        if (active) setProxyBackgroundUrl(backgroundImage);
        return;
      }

      try {
        const res = await fetch(`/api/proxy?url=${encodeURIComponent(backgroundImage)}`);
        if (!res.ok) throw new Error();
        const blob = await res.blob();
        if (active) {
          objectUrl = URL.createObjectURL(blob);
          setProxyBackgroundUrl(objectUrl);
        }
      } catch (e) {
        console.warn('[Proxy] Background failed, using direct URL');
        if (active) setProxyBackgroundUrl(backgroundImage);
      }
    };

    proxyBackground();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [backgroundImage]);

  // Avatars Proxy Effect
  useEffect(() => {
    let active = true;
    const currentObjectUrls: Record<number, string> = {};

    const proxyAvatars = async () => {
      const promises = contributors.map(async (contributor, index) => {
        const url = contributor.avatar_url;
        if (!url || url.startsWith('/') || url.startsWith('data:') || url.startsWith('blob:')) {
          return;
        }

        try {
          const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
          if (!res.ok) throw new Error();
          const blob = await res.blob();
          if (active) {
            const objectUrl = URL.createObjectURL(blob);
            currentObjectUrls[index] = objectUrl;
            setProxiedAvatars(prev => ({ ...prev, [index]: objectUrl }));
          }
        } catch (e) {
          console.warn(`[Proxy] Avatar ${index} failed, using fallback`);
          if (active) {
            const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.name)}&background=random&color=fff&size=128`;
            setProxiedAvatars(prev => ({ ...prev, [index]: fallbackUrl }));
          }
        }
      });

      if (active) setImageStatus('loading');
      await Promise.all(promises);
      if (active) setImageStatus('ready');
    };

    proxyAvatars();

    return () => {
      active = false;
      Object.values(currentObjectUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [JSON.stringify(contributors.map(c => c.avatar_url))]);

  return { proxyBackgroundUrl, proxiedAvatars, imageStatus };
}
