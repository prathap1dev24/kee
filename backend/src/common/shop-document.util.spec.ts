import { persistShopDocuments, SHOP_DOCUMENT_TYPES } from './shop-document.util';
import { FileService } from '../customer/file.service';

describe('persistShopDocuments', () => {
  const PNG_DATA_URI =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

  let fileService: jest.Mocked<FileService>;
  let tx: { shopDocument: { create: jest.Mock } };

  beforeEach(() => {
    fileService = {
      uploadFile: jest.fn().mockResolvedValue({ fileUrl: '/api/uploads/generated.png', fileKey: 'generated.png' }),
    } as unknown as jest.Mocked<FileService>;

    tx = { shopDocument: { create: jest.fn().mockResolvedValue({ id: 'doc-1' }) } };
  });

  it('persists all three document types when all are provided', async () => {
    await persistShopDocuments(fileService, tx, 'shop-1', {
      shopPhoto: PNG_DATA_URI,
      shopLicense: PNG_DATA_URI,
      ownerAadhaar: PNG_DATA_URI,
    });

    expect(fileService.uploadFile).toHaveBeenCalledTimes(3);
    expect(tx.shopDocument.create).toHaveBeenCalledTimes(3);

    const createdTypes = tx.shopDocument.create.mock.calls.map((call) => call[0].data.documentType);
    expect(createdTypes).toEqual([
      SHOP_DOCUMENT_TYPES.SHOP_PHOTO,
      SHOP_DOCUMENT_TYPES.SHOP_LICENSE,
      SHOP_DOCUMENT_TYPES.OWNER_AADHAAR,
    ]);
  });

  it('skips document types that are not provided', async () => {
    await persistShopDocuments(fileService, tx, 'shop-1', { shopPhoto: PNG_DATA_URI });

    expect(fileService.uploadFile).toHaveBeenCalledTimes(1);
    expect(tx.shopDocument.create).toHaveBeenCalledTimes(1);
    expect(tx.shopDocument.create.mock.calls[0][0].data.documentType).toBe(SHOP_DOCUMENT_TYPES.SHOP_PHOTO);
  });

  it('skips values that are not valid base64 data URIs (e.g. already-decoded or malformed input)', async () => {
    await persistShopDocuments(fileService, tx, 'shop-1', {
      shopPhoto: 'not-a-data-uri',
      shopLicense: '',
    });

    expect(fileService.uploadFile).not.toHaveBeenCalled();
    expect(tx.shopDocument.create).not.toHaveBeenCalled();
  });

  it('does nothing when no documents are provided', async () => {
    await persistShopDocuments(fileService, tx, 'shop-1', {});
    expect(fileService.uploadFile).not.toHaveBeenCalled();
    expect(tx.shopDocument.create).not.toHaveBeenCalled();
  });

  it('associates the created document with the given shopId and the uploaded file pointers', async () => {
    await persistShopDocuments(fileService, tx, 'shop-42', { shopPhoto: PNG_DATA_URI });

    expect(tx.shopDocument.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        shopId: 'shop-42',
        documentType: SHOP_DOCUMENT_TYPES.SHOP_PHOTO,
        fileUrl: '/api/uploads/generated.png',
        fileKey: 'generated.png',
      }),
    });
  });
});
