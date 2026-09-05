import { Request, Response } from "express";
import mongoose from "mongoose";
import { BlogPost } from "../models/BlogPost";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import {
  CreateBlogPostInput,
  UpdateBlogPostInput,
} from "../validators/blogValidators";

// PUBLIC: featured posts first, published:true enforced at the query level.
// This is the critical security boundary — a draft can NEVER reach this
// response no matter what the frontend does with it.
export const getPublicBlogPosts = asyncHandler(async (_req: Request, res: Response) => {
  const posts = await BlogPost.find({ published: true }).sort({ featured: -1, publishedAt: -1 });
  res.status(200).json({ success: true, data: posts });
});

// PUBLIC: single post by slug, published:true enforced at the query level.
export const getPublicBlogPostBySlug = asyncHandler(async (req: Request, res: Response) => {
  const post = await BlogPost.findOne({
    slug: req.params.slug,
    published: true,
  });
  if (!post) {
    // Same 404 whether the slug doesn't exist OR the post is a draft.
    // A caller can't distinguish "no such post" from "that post is a draft".
    throw new AppError("Blog post not found", 404);
  }
  res.status(200).json({ success: true, data: post });
});

// ADMIN: every post, including drafts, for management.
export const getAllBlogPosts = asyncHandler(async (_req: Request, res: Response) => {
  const posts = await BlogPost.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: posts });
});

export const getBlogPostById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid post ID", 400);
  }

  const post = await BlogPost.findById(id);
  if (!post) {
    throw new AppError("Blog post not found", 404);
  }
  res.status(200).json({ success: true, data: post });
});

export const createBlogPost = asyncHandler(async (req: Request, res: Response) => {
  // Explicitly whitelist creatable fields to prevent mass assignment.
  const { title, slug, excerpt, content, coverImage, author, featured, published } =
    req.body as CreateBlogPostInput;

  const publishedAt = published ? new Date() : null;

  const post = await BlogPost.create({
    title,
    slug,
    excerpt,
    content,
    coverImage,
    author,
    featured,
    published,
    publishedAt,
  });
  res.status(201).json({ success: true, message: "Blog post created", data: post });
});

export const updateBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid post ID", 400);
  }

  const existing = await BlogPost.findById(id);
  if (!existing) {
    throw new AppError("Blog post not found", 404);
  }

  // Explicitly whitelist updateable fields to prevent mass assignment.
  const {
    title,
    slug,
    excerpt,
    content,
    coverImage,
    author,
    featured,
    published,
  } = req.body as UpdateBlogPostInput;

  const updatePayload: Partial<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
    author: string;
    featured: boolean;
    published: boolean;
    publishedAt: Date | null;
  }> = {};

  if (title !== undefined) updatePayload.title = title;
  if (slug !== undefined) updatePayload.slug = slug;
  if (excerpt !== undefined) updatePayload.excerpt = excerpt;
  if (content !== undefined) updatePayload.content = content;
  if (coverImage !== undefined) updatePayload.coverImage = coverImage;
  if (author !== undefined) updatePayload.author = author;
  if (featured !== undefined) updatePayload.featured = featured;
  if (published !== undefined) {
    updatePayload.published = published;
    // If transitioning from draft → published for the first time, stamp publishedAt.
    if (published === true && !existing.publishedAt) {
      updatePayload.publishedAt = new Date();
    }
  }

  const post = await BlogPost.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, message: "Blog post updated", data: post });
});

export const deleteBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid post ID", 400);
  }

  const post = await BlogPost.findByIdAndDelete(id);
  if (!post) {
    throw new AppError("Blog post not found", 404);
  }
  res.status(200).json({ success: true, message: "Blog post deleted" });
});
