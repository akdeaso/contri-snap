import { useState, RefObject } from 'react';
import { toPng } from 'html-to-image';
import { LEADERBOARD_WIDTH, LEADERBOARD_HEIGHT } from '@/constants';

export function useExport(leaderboardRef: RefObject<HTMLDivElement | null>, month: string | undefined, year: string | undefined) {
  const [exporting, setExporting] = useState(false);

  const generateExportImage = async () => {
    if (!leaderboardRef.current) return null;
    return await toPng(leaderboardRef.current, {
      width: LEADERBOARD_WIDTH,
      height: LEADERBOARD_HEIGHT,
      style: {
        transform: 'none',
        width: `${LEADERBOARD_WIDTH}px`,
        height: `${LEADERBOARD_HEIGHT}px`,
        margin: '0',
        padding: '0',
        left: '0',
        top: '0',
        borderRadius: '0',
      },
      quality: 1,
      pixelRatio: 2,
      skipAutoScale: true,
      cacheBust: false,
    });
  };

  const handleDownload = async () => {
    setExporting(true);
    try {
      const dataUrl = await generateExportImage();
      if (!dataUrl) throw new Error('Failed to generate image');
      
      const link = document.createElement('a');
      link.download = `top-contributors-${month}-${year}.png`;
      link.href = dataUrl;
      link.click();
      return { success: true, message: 'Image downloaded successfully!' };
    } catch (error) {
      console.error('[Export] Error:', error);
      return { success: false, message: 'Failed to export image.' };
    } finally {
      setExporting(false);
    }
  };

  const handleCopy = async () => {
    setExporting(true);
    try {
      const dataUrl = await generateExportImage();
      if (!dataUrl) throw new Error('Failed to generate image');

      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': fetch(dataUrl).then((r) => r.blob()),
        }),
      ]);
      return { success: true, message: 'Image copied to clipboard!' };
    } catch (error) {
      console.error('[Export] Error:', error);
      return { success: false, message: 'Failed to copy image.' };
    } finally {
      setExporting(false);
    }
  };

  const handleOpen = async () => {
    setExporting(true);
    try {
      const dataUrl = await generateExportImage();
      if (!dataUrl) throw new Error('Failed to generate image');
      
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Leaderboard Preview - ${month} ${year}</title>
              <style>
                body { 
                  margin: 0; 
                  background: #0f172a; 
                  padding: 40px 20px; 
                  display: flex; 
                  flex-direction: column; 
                  align-items: center; 
                  min-height: 100vh;
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                }
                .container {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  gap: 20px;
                  max-width: ${LEADERBOARD_WIDTH}px;
                }
                .controls { 
                  color: #94a3b8; 
                  font-size: 14px;
                  background: rgba(255,255,255,0.05);
                  padding: 8px 16px;
                  border-radius: 20px;
                  backdrop-filter: blur(8px);
                }
                img { 
                  max-width: 100%; 
                  height: auto; 
                  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); 
                  border-radius: 4px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="controls">Right-click image and select "Save Image As..." to download</div>
                <img src="${dataUrl}" />
              </div>
            </body>
          </html>
        `);
        newWindow.document.close();
        return { success: true };
      } else {
        return { success: false, message: 'Popup blocked! Please allow popups.' };
      }
    } catch (error) {
      console.error('[Export] Error:', error);
      return { success: false, message: 'Failed to open image.' };
    } finally {
      setExporting(false);
    }
  };

  return { exporting, handleDownload, handleCopy, handleOpen };
}
