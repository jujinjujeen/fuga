import { vi } from 'vitest';

const populatePrismaMock = () => ({
  create: vi.fn(),
  upsert: vi.fn(),
  createMany: vi.fn(),
  findUnique: vi.fn(),
  findMany: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
});

vi.mock('@f/prismaInstance', () => {
  return {
    default: {
      product: populatePrismaMock(),
      image: populatePrismaMock(),
      $queryRaw: vi.fn(),
    },
  };
});
