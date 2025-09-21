// src/lib/models/Cart.ts
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export enum Currency {
  _BRL = "BRL",
  _USD = "USD",
  _EUR = "EUR"
}

// Considere exportar Color/Size enums de um arquivo central depois.

export interface ICartItem {
  productId: Types.ObjectId;
  name: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
  imageUrl?: string;
  currency?: Currency;
  variantId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICart extends Document {
  userId: Types.ObjectId;
  sessionId?: string;
  items: ICartItem[];
  expiresAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  productId: { type: Schema.Types.ObjectId, required: true, ref: 'Product' },
  name: { type: String, required: true, minlength: 2, maxlength: 100 },
  price: { type: Number, required: true, min: 0.01, max: 100000 },
  color: { type: String, required: true, enum: ['black', 'white', 'red', 'blue', 'green'] },
  size: { type: String, required: true, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  quantity: { type: Number, required: true, min: 1, max: 100, default: 1 },
  imageUrl: {
    type: String,
    validate: {
      validator: (v: string) => /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/.test(v),
      message: 'URL de imagem inválida'
    }
  },
  currency: { type: String, enum: Object.values(Currency), default: Currency.BRL },
  variantId: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

// TTL automático
const CartSchema = new Schema<ICart>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true, sparse: true },
  sessionId: { type: String, index: true, sparse: true },
  items: {
    type: [CartItemSchema], default: [],
    validate: { validator: (v: ICartItem[]) => v.length <= 100, message: 'Carrinho excede o limite de 100 itens' }
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true,
  versionKey: false
});

// Middleware para atualizar "updatedAt" dos itens ao salvar
CartSchema.pre<ICart>('save', function(next) {
  this.items = this.items.map(item => ({
    ...item,
    updatedAt: new Date()
  }));
  next();
});

// Static para busca flexível por user/session
CartSchema.statics.findByUserOrSession = function(userId: string | null, sessionId: string) {
  return this.findOne({
    $or: [
      { userId: userId ? new Types.ObjectId(userId) : null },
      { sessionId }
    ]
  });
};

interface CartModel extends Model<ICart> {
  findByUserOrSession(_userId: string | null, _sessionId: string): Promise<ICart | null>;
}

const Cart: CartModel = mongoose.models.Cart as CartModel || mongoose.model<ICart, CartModel>('Cart', CartSchema);
export default Cart;
