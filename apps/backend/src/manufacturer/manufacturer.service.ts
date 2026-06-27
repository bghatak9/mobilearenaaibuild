import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';

@Injectable()
export class ManufacturerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateManufacturerDto) {
    return this.prisma.manufacturer.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.manufacturer.findMany();
  }

  async findOne(id: number) {
    return this.prisma.manufacturer.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateManufacturerDto: UpdateManufacturerDto) {
    await this.findOne(id);

    return this.prisma.manufacturer.update({
      where: { id },
      data: updateManufacturerDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.manufacturer.delete({
      where: { id },
    });
  }
}