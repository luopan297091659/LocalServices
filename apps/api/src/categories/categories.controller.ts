import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Public()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly prisma: PrismaService) {}
  @Get()
  list() {
    return this.prisma.category.findMany({ where: { enabled: true, parentId: null }, include: { children: { where: { enabled: true }, orderBy: { sort: 'asc' } } }, orderBy: { sort: 'asc' } });
  }
}
