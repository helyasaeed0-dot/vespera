const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    color: { type: String, trim: true },
    size: { type: String, trim: true },
    image: { type: String, default: "" },
    price: { type: Number },
    stock: { type: Number, default: 0 },
    sku: { type: String, trim: true },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    shortDescription: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    categorySlug: {
      type: String,
      required: [true, "Category slug is required"],
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    salePrice: {
      type: Number,
      default: null,
      min: [0, "Sale price cannot be negative"],
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
      index: true,
    },
    sku: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "A product must have at least one image",
      },
    },
    imageObjects: {
      type: [
        {
          url: { type: String, required: true },
          color: { type: String, trim: true, default: "" },
        },
      ],
      default: [],
    },
    thumbnail: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      trim: true,
      default: "",
    },
    colors: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [String],
      default: [],
    },
    specs: {
      type: Map,
      of: String,
      default: {},
    },
    variants: [variantSchema],
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
      index: true,
    },
    showOnHomePage: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual field for effective active price
productSchema.virtual("activePrice").get(function () {
  return this.salePrice !== null && this.salePrice !== undefined && this.salePrice < this.price
    ? this.salePrice
    : this.price;
});

// Text indexing for search
productSchema.index({ title: "text", description: "text", category: "text" });

module.exports = mongoose.model("Product", productSchema);
