import { Controller, Get, Post, Body, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  findAll(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.productsService.findAll(parseInt(page), parseInt(limit));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post('seed/:count')
  seed(@Param('count') count: string) {
    return this.productsService.bulkCreate(parseInt(count));
  }
}