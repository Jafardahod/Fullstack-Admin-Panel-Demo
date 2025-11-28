// app.js
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);

app.use(notFound);
app.use(errorHandler);

function printRoutes(app) {
  const routes = [];

  function traverse(stack, prefix = "") {
    stack.forEach((layer) => {
      // Direct route on this layer
      if (layer.route) {
        const methods = Object.keys(layer.route.methods)
          .map((m) => m.toUpperCase())
          .join(", ");
        // layer.route.path can be a string or array
        const path = Array.isArray(layer.route.path)
          ? layer.route.path.join(",")
          : layer.route.path;
        routes.push({ methods, path: prefix + path });
      }
      // This layer is a mounted router — dive into it
      else if (layer.name === "router" && layer.handle && layer.handle.stack) {
        // Attempt to recover the mount path from the layer.regexp
        let mountPath = "";
        if (layer.regexp && layer.regexp.source) {
          // Convert the regexp back to a readable path fragment.
          // This is heuristic but works for common mount cases like "/api/auth"
          const regex = layer.regexp.source
            .replace("\\/?", "")
            .replace("(?=\\/|$)", "")
            .replace("^", "")
            .replace("$", "");
          // regex might be something like "\/api\/auth\/?" -> convert back to '/api/auth'
          mountPath = regex ? "/" + regex.replace(/\\\//g, "/") : "";
        }
        traverse(layer.handle.stack, prefix + mountPath);
      }
    });
  }

  if (!app || !app._router) {
    console.log("No routes registered (app._router is undefined).");
    return;
  }

  traverse(app._router.stack, "");
  console.log("Registered routes:");
  if (routes.length === 0) {
    console.log("(no routes found)");
  } else {
    routes.forEach((r) => console.log(r.methods.padEnd(8), r.path));
  }
}

printRoutes(app);
export default app;
