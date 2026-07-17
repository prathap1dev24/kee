import { parseBase64DataUri } from './base64.util';

describe('parseBase64DataUri', () => {
  // 1x1 transparent PNG
  const PNG_BASE64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

  it('parses a valid PNG data URI', () => {
    const result = parseBase64DataUri(`data:image/png;base64,${PNG_BASE64}`);
    expect(result).not.toBeNull();
    expect(result!.mimeType).toBe('image/png');
    expect(result!.ext).toBe('.png');
    expect(result!.buffer.length).toBeGreaterThan(0);
    expect(Buffer.isBuffer(result!.buffer)).toBe(true);
  });

  it('parses a valid PDF data URI', () => {
    const pdfBase64 = Buffer.from('%PDF-1.4 fake pdf content').toString('base64');
    const result = parseBase64DataUri(`data:application/pdf;base64,${pdfBase64}`);
    expect(result).not.toBeNull();
    expect(result!.ext).toBe('.pdf');
    expect(result!.buffer.toString()).toContain('%PDF-1.4');
  });

  it('returns an empty extension for an unrecognized (but validly formed) mime type', () => {
    const result = parseBase64DataUri(`data:application/octet-stream;base64,${Buffer.from('x').toString('base64')}`);
    expect(result).not.toBeNull();
    expect(result!.ext).toBe('');
    expect(result!.mimeType).toBe('application/octet-stream');
  });

  it.each([
    ['undefined', undefined],
    ['null', null],
    ['empty string', ''],
    ['non-data-uri string', 'not-a-data-uri'],
    ['a plain fileUrl (legacy shape)', '/api/uploads/some-file.png'],
    ['a number', 42],
    ['an object', { fileUrl: 'x' }],
  ])('returns null for %s', (_label, value) => {
    expect(parseBase64DataUri(value as any)).toBeNull();
  });

  it('returns null when the base64 payload is empty', () => {
    expect(parseBase64DataUri('data:image/png;base64,')).toBeNull();
  });

  it('trims surrounding whitespace before parsing', () => {
    const result = parseBase64DataUri(`   data:image/png;base64,${PNG_BASE64}   `);
    expect(result).not.toBeNull();
  });
});
