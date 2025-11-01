import { Request, Response } from 'express';

export const productsController = (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Products endpoint' });
};
