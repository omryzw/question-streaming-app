import { Injectable } from '@angular/core';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import hljs from 'highlight.js';

@Injectable({ providedIn: 'root' })
export class MarkdownRendererService {
  private renderer = new marked.Renderer();

  constructor(private sanitizer: DomSanitizer) {
    marked.setOptions({
      highlight: (code, lang) => {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      },
      breaks: true,
      gfm: true
    });

    this.configureRenderer();
  }

  private configureRenderer() {
    this.renderer.link = (href, title, text) => {
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" ${title ? `title="${title}"` : ''}>${text}</a>`;
    };
  }

  render(content: string): SafeHtml {
    const rawHtml = marked.parse(content, { renderer: this.renderer });
    return this.sanitizer.bypassSecurityTrustHtml(rawHtml);
  }

  highlightAll() {
    setTimeout(() => hljs.highlightAll(), 50);
  }
}