import { TestBed } from '@angular/core/testing';

import { MarkdownRendererService } from './markdown-renderer.service';

describe('MarkdownRendererService', () => {
  let service: MarkdownRendererService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarkdownRendererService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
