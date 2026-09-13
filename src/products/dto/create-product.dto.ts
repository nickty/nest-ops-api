import { IsString, IsNumber, IsOptional, Min, MaxLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsString()
  category?: string;
}