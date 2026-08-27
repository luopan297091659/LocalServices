import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../common/public.decorator';
import { SearchMerchantsDto } from './dto/search-merchants.dto';
import { MerchantsService } from './merchants.service';

@Public()
@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchants: MerchantsService) {}
  @Get() list(@Query() query: SearchMerchantsDto) { return this.merchants.search(query); }
  @Get('search') search(@Query() query: SearchMerchantsDto) { return this.merchants.search(query); }
  @Get(':id/services') services(@Param('id') id: string) { return this.merchants.services(id); }
  @Get(':id/products') products(@Param('id') id: string) { return this.merchants.products(id); }
  @Get(':id/media') media(@Param('id') id: string) { return this.merchants.media(id); }
  @Get(':id/business-hours') hours(@Param('id') id: string) { return this.merchants.hours(id); }
  @Get(':id') getOne(@Param('id') id: string) { return this.merchants.getOne(id); }
}
