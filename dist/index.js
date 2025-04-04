"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoDb_1 = __importDefault(require("./db/mongoDb"));
const routes_1 = __importDefault(require("./routes"));
const swagger_1 = require("./utils/swagger");
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
}));
app.use(express_1.default.json());
// import routes
app.use("/api/v1", routes_1.default);
// Swagger setup
(0, swagger_1.setupSwagger)(app);
app.use("/", (req, res) => {
    res.status(200).json({ message: "Backend server is running..." });
});
app.use("*", (req, res) => {
    res.status(404).json({ message: "Route not found" });
});
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, mongoDb_1.default)();
        app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
    }
    catch (error) {
        console.log(error);
        process.exit(1);
    }
});
startServer();
