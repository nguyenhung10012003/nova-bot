import { Controller, Get, Param, Patch, Post, Query, Delete, UseGuards, Body } from "@nestjs/common";
import { SourcesService } from "./sources.service";
import { AccessTokenGuard } from "src/common/guards/access-token.guard";
import { CreateSourceDto } from "./sources.dto";

@Controller("sources")
@UseGuards(AccessTokenGuard)
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Get()
  async getSources(@Query("chatflowId") chatflowId: string, @Query("type") type: "WEBSITE" | "FILE" | "TEXT") {
    return this.sourcesService.getSources({ chatflowId, type });
  }

  @Get(":id")
  async getSource(@Param("id") id: string) {
    return this.sourcesService.getSource(id);
  }

  @Post()
  async createSource(@Body() data: CreateSourceDto) {
    return this.sourcesService.createSource(data);
  }

  @Patch(":id")
  async updateSource(@Body() data: Partial<CreateSourceDto>, @Param("id") id: string) {
    return this.sourcesService.updateSource(id, data);
  }

  @Delete(":id")
  async deleteSource(@Param("id") id: string) {
    return this.sourcesService.deleteSource(id);
  }
}