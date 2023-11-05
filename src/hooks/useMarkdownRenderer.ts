import { MarkdownRenderer } from 'obsidian';
import { VIEW_TYPE } from '@/cardLibraryIndex';
import { useCallback, useEffect, useRef } from 'react';

function useMarkdownRenderer(app, view) {
  const contentRef = useRef(null);

  // 缓存的渲染方法
  const renderMarkdown = useCallback(
    async (path, content) => {
      // content 是外部传入的文件内容
      if (!contentRef.current || !path || !app || !view) return;

      const target = content || `![[${path}]]`;

      if (contentRef.current.hasChildNodes()) {
        contentRef.current.empty(); // 使用 innerHTML = '' 来清空子元素
      }

      await MarkdownRenderer.render(app, target, contentRef.current, path, view);

      contentRef.current?.toggleClass(['markdown-rendered'], true);

      const embeds = contentRef.current?.querySelectorAll('.internal-link');
      embeds?.forEach((embed) => {
        const el = embed as HTMLAnchorElement;
        const href = el.getAttribute('data-href');
        if (!href) return;

        const destination = app.metadataCache.getFirstLinkpathDest(href, path);
        if (!destination) embed.classList.add('is-unresolved');

        el.addEventListener('mouseover', (e) => {
          e.stopPropagation();
          app.workspace.trigger('hover-link', {
            event: e,
            source: VIEW_TYPE,
            hoverParent: view.containerEl,
            targetEl: el,
            linktext: href,
            sourcePath: el.href,
          });
        });
      });
    },
    [app, view],
  );

  useEffect(() => {
    return () => {
      if (contentRef.current) {
        contentRef.current.empty();
      }
    };
  }, [renderMarkdown]);

  return {
    render: renderMarkdown,
    ref: contentRef,
  };
}

export default useMarkdownRenderer;
