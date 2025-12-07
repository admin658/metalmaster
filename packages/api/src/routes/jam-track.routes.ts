import express from 'express';
import { supabase } from '../index';
import { authenticate } from '../middleware/auth';
import { CreateJamTrackSchema, UpdateJamTrackSchema, CreateJamSessionSchema } from '@metalmaster/shared-validation';

export const jamTrackRoutes = express.Router();

jamTrackRoutes.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const difficulty = req.query.difficulty as string;

    let query = supabase
      .from('jam_tracks')
      .select('*', { count: 'exact' });

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

jamTrackRoutes.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('jam_tracks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Jam track not found',
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

jamTrackRoutes.post('/', authenticate, async (req, res, next) => {
  try {
    const validated = CreateJamTrackSchema.parse(req.body);
    const userId = req.user?.id;

    const { data, error } = await supabase
      .from('jam_tracks')
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

jamTrackRoutes.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const validated = UpdateJamTrackSchema.parse(req.body);
    const { id } = req.params;

    const { data, error } = await supabase
      .from('jam_tracks')
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

jamTrackRoutes.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('jam_tracks')
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

jamTrackRoutes.post('/:jamTrackId/sessions', authenticate, async (req, res, next) => {
  try {
    const validated = CreateJamSessionSchema.parse(req.body);
    const userId = req.user?.id;
    const { jamTrackId } = req.params;

    const { data, error } = await supabase
      .from('jam_sessions')
      .insert({
        ...validated,
        user_id: userId,
        jam_track_id: jamTrackId,
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

jamTrackRoutes.get('/:jamTrackId/sessions', authenticate, async (req, res, next) => {
  try {
    const { jamTrackId } = req.params;
    const userId = req.user?.id;

    const { data, error } = await supabase
      .from('jam_sessions')
      .select('*')
      .eq('jam_track_id', jamTrackId)
      .eq('user_id', userId);

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
