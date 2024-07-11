import mongoose from "mongoose";
import { nanoid } from "nanoid";
import ShortLinkSchema from "./schema/index.js"; // Verifique o caminho e a extensão do arquivo

class LinkShortener {
  constructor() {
    this.db = null;
  }

  async connect(connectionUrl) {
    try {
      if (!connectionUrl) throw new Error("Connection URL is required");
      if (!this.db) {
        await mongoose.connect(connectionUrl, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        this.db = mongoose.connection;
        console.log("Connected to the database");
      } else {
        console.log("Already connected to the database");
      }
    } catch (err) {
      console.error("Database connection error:", err);
    }
  }

  async disconnect() {
    try {
      if (this.db) {
        await mongoose.disconnect();
        this.db = null;
        console.log("Disconnected from the database");
      }
    } catch (err) {
      console.error("Database disconnection error:", err);
    }
  }

  async createShortLink(originalUrl, hostName, expire) {
    if (!this.db) throw new Error("Not connected to the database");

    if (!originalUrl || !hostName) throw new Error("Original URL and hostName are required");

    const shortId = nanoid(4);
    const shortedLink = `${hostName}/${shortId}`;
    const ShortLink = mongoose.model("ShortLink", ShortLinkSchema);

    if(await ShortLink.findOne({ shortedLink })) {
      throw new Error("Short link already exists");
    }

    const newLink = new ShortLink({
      originalUrl,
      shortedLink,
      createdAt: new Date(),
      expire: expire ? new Date(expire) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // default 30 days
    });

    await newLink.save();

    return {
      originalUrl,
      shortedLink,
      expire: newLink.expire,
    };
  }

  async getOriginalUrl(shortLink) {
    if (!this.db) throw new Error("Not connected to the database");

    const ShortLink = mongoose.model("ShortLink", ShortLinkSchema);

    const findLink = await ShortLink.findOne({ shortedLink: shortLink });

    if (!findLink) throw new Error("Link not found");

    if (findLink.expire && findLink.expire < new Date()) {
      throw new Error("Link expired");
    }

    return {
      originalUrl: findLink.originalUrl,
      shortedLink: findLink.shortedLink,
      expire: findLink.expire,
    };
    }
}

export default new LinkShortener();
