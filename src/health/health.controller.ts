import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../common/db/prisma.service";

@Controller("health")
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async health() {
    const orgCount = await this.prisma.org.count();

    return {
      status: "ok",
      database: "connected",
      orgs: orgCount,
      timestamp: new Date(),
    };
  }
}