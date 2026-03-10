import { Db, MongoClient, ServerApiVersion } from "mongodb";
import { envs } from "../configs/env.config";
import { BadRequestError, InternalServerError } from "../core/error.response";
import {
  AdminTokenCollection,
  initAdminTokenCollection,
} from "../modules/admin-token/admin-token.schema";
import {
  AdminCollection,
  initAdminCollection,
} from "../modules/admin/admin.schema";
import { logger } from "../utils/logger.util";
import {
  BadWordCollection,
  initBadWordCollection,
} from "~/modules/bad-word/bad-word.schema";

const _MINPOOLSIZE = 5;
const _MAXPOOLSIZE = 50; // không bao giờ vượt, nếu hơn thì phải chờ
const _SOCKET_TIMEOUT_MS = 45000; // 45 giây

class Database {
  private db: Db;
  static client: MongoClient;
  private isConnected: boolean = false;
  private isConnecting: boolean = false;
  static instance: Database | null = null;

  // 1️⃣ PRIVATE constructor - Ngăn tạo instance từ bên ngoài
  private constructor() {
    try {
      // Chỉ khởi tạo client khi chưa có
      if (!Database.client) {
        Database.client = new MongoClient(envs.DB_CONNECT_STRING, {
          serverApi: {
            deprecationErrors: true,
            version: ServerApiVersion.v1,
          },
          minPoolSize: _MINPOOLSIZE,
          maxPoolSize: _MAXPOOLSIZE,

          retryWrites: true,
          retryReads: true,
          tls: true,
          w: "majority",

          monitorCommands: false,
          socketTimeoutMS: _SOCKET_TIMEOUT_MS,

          // 🆕 Các option quan trọng để giảm lỗi monitor timeout
          heartbeatFrequencyMS: 60000, // Gửi heartbeat chậm hơn: mỗi 20 giây thay vì 10 giây → ít nhạy cảm với latency ngắn
          connectTimeoutMS: 30000, // Thời gian chờ mở socket mới (default 30s, nhưng set rõ cho chắc)
          serverSelectionTimeoutMS: 30000, // Thời gian chọn server khi reconnect
          // maxIdleTimeMS: 300000,       // Optional: đóng connection idle sau 5 phút nếu muốn tiết kiệm
        });
      }
      this.db = Database.client.db(envs.DB_NAME);
    } catch (error) {
      console.error("MongoDB client initialization failed:", error);
      throw new InternalServerError("MongoDB client initialization failed");
    }
  }

  // 2️⃣ PUBLIC getInstance() - Cách duy nhất để lấy instance
  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  static getClient(): MongoClient {
    if (!Database.client) {
      throw new BadRequestError("Database client not initialized");
    }
    return Database.client;
  }

  private checkConnection() {
    if (!this.isConnected) {
      throw new BadRequestError("Database not connected. Call connect() first");
    }
  }

  static async countConnections(): Promise<number> {
    try {
      if (!Database.instance?.isConnected) {
        return 0;
      }
      const stats = await Database.instance.db.admin().serverStatus();
      return stats.connections.current;
    } catch (error) {
      logger.error("Count connections failed:", error);
      return 0;
    }
  }

  async connect() {
    try {
      // 🆕 Prevent multiple concurrent connections
      if (this.isConnecting) {
        logger.warn("Connection already in progress");
        return;
      }

      if (this.isConnected) {
        logger.warn("Already connected to MongoDB");
        return;
      }

      await Database.client.connect();
      console.log("[v0] After connect:", await Database.countConnections());

      await this.db.command({ ping: 1 });
      console.log("[v0] After ping:", await Database.countConnections());
      this.isConnected = true;

      logger.info("Connected to MongoDB successfully");
    } catch (error) {
      this.isConnected = false; // 🆕 Reset on error
      logger.error("MongoDB connection failed:", error);
      throw new InternalServerError("MongoDB connection failed"); // Re-throw để app biết lỗi
    } finally {
      this.isConnecting = false; // 🆕 Always reset flag
    }
  }

  async disconnect() {
    await Database.client.close();
    logger.info("❌ Disconnected from MongoDB ❌");
  }

  async initialCollections() {
    try {
      this.checkConnection();
      initAdminCollection(this.db);
      initAdminTokenCollection(this.db);
      initBadWordCollection(this.db);
    } catch (error) {
      logger.error("Collection initialization failed:", error);
      throw error;
    }
  }

  async initialIndex() {
    try {
      this.checkConnection();

      // Admin Collection
      const indexAdmin = await AdminCollection.indexExists([
        "name_1",
        "email_1",
      ]);

      // AdminToken Collection
      const indexAdminToken = await AdminTokenCollection.indexExists([
        "admin_id_1",
        "token_1",
      ]);

      // BadWord Collection
      const indexBadWord = await BadWordCollection.indexExists(["words_1"]);

      // Chỉ tạo index nếu chưa tồn tại, tránh lỗi khi chạy lại nhiều lần
      if (!indexAdmin) {
        await AdminCollection.createIndexes([
          {
            key: { name: 1 },
            name: "name_1",
          },
          {
            key: { email: 1 },
            name: "email_1",
            unique: true,
          },
        ]);
      }

      if (!indexAdminToken) {
        await AdminTokenCollection.createIndexes([
          {
            key: { admin_id: 1, token: 1 },
            name: "admin_id_1_token_1",
            unique: true,
          },
        ]);
      }

      if (!indexBadWord) {
        await BadWordCollection.createIndexes([
          { key: { words: 1 }, name: "words_1", unique: true },
        ]);
      }

      logger.info("All indexes are ensured successfully");
    } catch (error) {
      logger.error("Index initialization failed:", error);
      throw error;
    }
  }
}

// ✅ Export getInstance => Singleton > chỉ cho phép có 1 kết nối.
const instanceMongodb = Database.getInstance();
const clientMongodb = Database.getClient();
export { clientMongodb, Database, instanceMongodb };
