import express from 'express';
import { supabase } from '../index';
import { authenticate } from '../middleware/auth';
import { CreateRiffSchema, UpdateRiffSchema } from '@metalmaster/shared-validation';

export const riffRoutes = express.Router();

riffRoutes.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const genre = req.query.genre as string;
    const difficulty = req.query.difficulty as string;

    let query = supabase
      .from('riffs')
      .select('*', { count: 'exact' });

    if (genre) {
      query = query.eq('genre', genre);
    }

    if (difficulty) {
      query = query.eq('difficulty_level', difficulty);
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

riffRoutes.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('riffs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Riff not found',
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

riffRoutes.post('/', authenticate, async (req, res, next) => {
  try {
    const validated = CreateRiffSchema.parse(req.body);
    const userId = req.user?.id;

    const { data, error } = await supabase
      .from('riffs')
      .insert({
        ...validated,
        created_by: userId,
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

riffRoutes.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const validated = UpdateRiffSchema.parse(req.body);
    const { id } = req.params;

    const { data, error } = await supabase
      .from('riffs')
      .update(validated)
      .eq('id', id)
      .select()
      .single();

    if (error) {
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

riffRoutes.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('riffs')
      .delete()
      .eq('id', id);

    if (error) {
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
