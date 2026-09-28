import express from "express";
import { addToCart, getCart, updateCartItem, removeCartItem, clearCart } from "../controllers/cartController.js";
import { validate } from "../validation/validate.js";
import { cartItemBody, cartRemoveBody, cartUserParams } from "../validation/schemas/commerce.schemas.js";

const router = express.Router();

router.post("/add", validate({ body: cartItemBody }), addToCart);
router.get("/:userId", getCart);
router.put("/update", validate({ body: cartItemBody }), updateCartItem);
router.delete("/remove", validate({ body: cartRemoveBody }), removeCartItem);
router.delete("/clear/:userId", validate({ params: cartUserParams }), clearCart);

export default router;