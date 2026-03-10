import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/db/prisma.service";

@Injectable()
export class OrgsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.org.findMany({
      include: { members: true },
    });
  }
}