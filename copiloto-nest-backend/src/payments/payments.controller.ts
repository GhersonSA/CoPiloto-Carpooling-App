import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { NoGuestGuard } from '../auth/guards/guest.guard';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get()
  async findAll(@CurrentUser() user: { id: number }) {
    return this.paymentsService.findByUserId(user.id);
  }

  @Post()
  @UseGuards(NoGuestGuard)
  async create(@Body() createDto: CreatePaymentDto) {
    return this.paymentsService.create(createDto);
  }

  @Put(':id')
  @UseGuards(NoGuestGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePaymentDto,
  ) {
    return this.paymentsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(NoGuestGuard)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.delete(id);
  }
}
