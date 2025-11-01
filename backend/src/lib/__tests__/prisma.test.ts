import { describe, it, expect, vi, Mock } from 'vitest';

vi.mock('@prisma/client', () => {
  const PrismaClient = vi.fn().mockImplementation(() => {
    return {};
  });
  return { PrismaClient };
});

import prisma from '../prisma';
import { PrismaClient } from '@prisma/client';

describe('prismaClient module', () => {
  it('instantiates PrismaClient exactly once and exports that instance', () => {
    expect((PrismaClient as Mock)).toHaveBeenCalledTimes(1);

    const firstReturnValue = (PrismaClient as Mock)?.mock?.results?.[0]?.value;
    expect(prisma).toBe(firstReturnValue);
  });
});