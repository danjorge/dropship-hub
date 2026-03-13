import "dotenv/config";
import { OnModuleInit, OnModuleDestroy, BeforeApplicationShutdown } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy, BeforeApplicationShutdown {
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    beforeApplicationShutdown(): Promise<void>;
}
