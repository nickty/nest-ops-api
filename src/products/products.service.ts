import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create(dto);
    return this.productRepo.save(product);
  }

  async findAll(page = 1, limit = 20): Promise<{ data: Product[]; total: number }> {
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
      const batch = Array.from({ length: Math.min(batchSize, count - i) }, (_, k) => ({
        name: `Product ${i + k}`,
        description: `Generated product #${i + k}`,
        price: Math.round(Math.random() * 10000) / 100,
        stock: Math.floor(Math.random() * 1000),
        category: ['electronics', 'clothing', 'food', 'toys'][Math.floor(Math.random() * 4)],
      }));
      await this.productRepo.insert(batch);
      inserted += batch.length;
    }
    return { inserted };
  }
}