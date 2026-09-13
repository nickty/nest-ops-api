import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { format } from '@fast-csv/format'
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
;

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create(dto);
    return this.productRepo.save(product);
  }

  async findAll(
    page = 1,
    limit = 20,
  ): Promise<{ data: Product[]; total: number }> {
    // WHY skip/take: pagination — never return a million rows at once
    const [data, total] = await this.productRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async bulkCreate(count: number): Promise<{ inserted: number }> {
    // WHY batch: single insert per row = slow. Batch of 1000 = fast.
    const batchSize = 1000;
    let inserted = 0;
    for (let i = 0; i < count; i += batchSize) {
      const batch = Array.from(
        { length: Math.min(batchSize, count - i) },
        (_, k) => ({
          name: `Product ${i + k}`,
          description: `Generated product #${i + k}`,
          price: Math.round(Math.random() * 10000) / 100,
          stock: Math.floor(Math.random() * 1000),
          category: ['electronics', 'clothing', 'food', 'toys'][
            Math.floor(Math.random() * 4)
          ],
        }),
      );
      await this.productRepo.insert(batch);
      inserted += batch.length;
    }
    return { inserted };
  }

  async streamCsvToResponse(res: Response): Promise<void> {
    const PAGE_SIZE = 5000;

    // csvStream is our writable sink. It emits strings.
    const csvStream = format({ headers: true });
    csvStream.pipe(res);

    // 🧠 RESPECT BACKPRESSURE
    // If csvStream.write() returns false, we must wait for 'drain'
    const write = (row: Record<string, unknown>): Promise<void> =>
      new Promise((resolve) => {
        const ok = csvStream.write(row);
        if (ok) resolve();
        else csvStream.once('drain', resolve);
      });

    try {
      let offset = 0;
      while (true) {
        // 🧠 PAGE THE DB — never load 1M rows into memory
        const page = await this.productRepo.find({
          order: { createdAt: 'ASC' },
          skip: offset,
          take: PAGE_SIZE,
        });

        if (page.length === 0) break;

        for (const p of page) {
          await write({
            id: p.id,
            name: p.name,
            description: p.description ?? '',
            price: p.price,
            stock: p.stock,
            category: p.category,
            createdAt: p.createdAt.toISOString(),
          });
        }

        offset += page.length;
        this.logger.log(`Exported ${offset} rows so far...`);
      }

      csvStream.end();
    } catch (err) {
      this.logger.error('CSV export failed', err as Error);
      csvStream.destroy();
      if (!res.headersSent) res.status(500).end();
      else res.end();
    }
  }
}
