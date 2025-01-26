import express from "express";
import { checkFavoriteStatus, getFavorites, toggleFavorite } from "../controllers/favorite.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.get("/toggle/:id", isAuthenticated, toggleFavorite);
router.get("/check/:id", isAuthenticated, checkFavoriteStatus);
router.get("/user/:id?", isAuthenticated, getFavorites);

export default router;
