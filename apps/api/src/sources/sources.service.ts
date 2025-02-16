import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSourceDto } from './sources.dto';

@Injectable()
export class SourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async getSources({
    chatflowId,
    type,
  }: {
    chatflowId: string;
    type?: 'WEBSITE' | 'FILE' | 'TEXT';
  }) {
    return this.prisma.source.findMany({
      where: { chatflowId, type },
    });
  }

  async getSource(id: string) {
    return this.prisma.source.findUnique({
      where: { id } ,
    });
  }

  async createSource(data: CreateSourceDto) {
    console.log(data);
    return this.prisma.source.create({
      data,
    });
  }

  async updateSource(id: string, data: Partial<CreateSourceDto>) {
    return this.prisma.source.update({
      where: { id },
      data,
    });
  }

  async deleteSource(id: string) {
    return this.prisma.source.delete({
      where: { id },
    });
  }
}
