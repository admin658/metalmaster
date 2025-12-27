import express from 'express';
import { supabase } from '../index';
import { authenticate } from '../middleware/auth';
import { CreateLessonSchema, UpdateLessonSchema } from '@metalmaster/shared-validation';

export const lessonRoutes = express.Router();
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const parsePage = (value?: string) => {
  const parsed = Number.parseInt(value ?? '', 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return DEFAULT_PAGE;
  }
  return parsed;
};

const parseLimit = (value?: string) => {
  const parsed = Number.parseInt(value ?? '', 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return DEFAULT_LIMIT;
  }
  return Math.min(parsed, MAX_LIMIT);
};

lessonRoutes.get('/', async (req, res, next) => {
  try {
    const page = parsePage(req.query.page as string | undefined);
    const limit = parseLimit(req.query.limit as string | undefined);
    const category = req.query.category as string;

    let query = supabase
      .from('lessons')
      .select('*', { count: 'exact' });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, count, error } = await query
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: {
        items: data || [],
        total: count || 0,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit),
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    next(error);
  }
});

lessonRoutes.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lesson not found',
        },
      });
    }

    res.json({
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    next(error);
  }
});

lessonRoutes.post('/', authenticate, async (req, res, next) => {
  try {
    const validated = CreateLessonSchema.parse(req.body);
    const userId = req.user?.id;

    const { data, error } = await supabase
      .from('lessons')
      .insert({
        ...validated,
        instructor_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    next(error);
  }
});

lessonRoutes.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const validated = UpdateLessonSchema.parse(req.body);
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const { data, error } = await supabase
      .from('lessons')
      .update(validated)
      .eq('id', id)
      .eq('instructor_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Lesson not found',
          },
        });
      }

      throw error;
    }

    res.json({
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    next(error);
  }
});

lessonRoutes.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id)
      .eq('instructor_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Lesson not found',
          },
        });
      }

      throw error;
    }

    res.json({
      success: true,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    next(error);
  }
});
