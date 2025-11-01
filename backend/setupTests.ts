import { vi } from 'vitest';

const populatePrismaMock = () => ({
  create: vi.fn(),
  upsert: vi.fn(),
  createMany: vi.fn(),
  findUnique: vi.fn(),
  findMany: vi.fn(),
});

vi.mock('@f/prismaInstance', () => {
  return {
    default: {
      products: populatePrismaMock(),
    },
  };
});
