import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

let supabase = null;
let isDemo = false;

if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase متصل');
} else {
  isDemo = true;
  console.log('ℹ️ Demo Mode — بدون Supabase');

  const demoStore = {};

  function matchFilters(row, filters) {
    return filters.every(f => {
      if (f.type === 'eq') return row[f.col] === f.val;
      if (f.type === 'neq') return row[f.col] !== f.val;
      if (f.type === 'gte') return row[f.col] >= f.val;
      if (f.type === 'lte') return row[f.col] <= f.val;
      if (f.type === 'is') return row[f.col] === f.val;
      if (f.type === 'not') {
        if (f.op === 'is') return row[f.col] !== f.val;
        return true;
      }
      return true;
    });
  }

  function createChainable(tableName) {
    let _filters = [];
    let _orderBy = null;
    let _orderAsc = true;
    let _limitCount = null;
    let _isSingle = false;
    let _isCount = false;
    let _isHead = false;
    let _insertData = null;
    let _updateData = null;

    const chain = {
      select(cols, opts) {
        if (opts?.count === 'exact') _isCount = true;
        if (opts?.head) _isHead = true;
        return chain;
      },
      insert(data) { _insertData = Array.isArray(data) ? data : [data]; return chain; },
      update(data) { _updateData = data; return chain; },
      eq(col, val) { _filters.push({ type: 'eq', col, val }); return chain; },
      neq(col, val) { _filters.push({ type: 'neq', col, val }); return chain; },
      gte(col, val) { _filters.push({ type: 'gte', col, val }); return chain; },
      lte(col, val) { _filters.push({ type: 'lte', col, val }); return chain; },
      is(col, val) { _filters.push({ type: 'is', col, val }); return chain; },
      not(col, op, val) { _filters.push({ type: 'not', col, op, val }); return chain; },
      order(col, opts) { _orderBy = col; _orderAsc = opts?.ascending ?? true; return chain; },
      limit(n) { _limitCount = n; return chain; },
      single() { _isSingle = true; return chain; },

      then(resolve, reject) {
        try {
          const table = demoStore[tableName] || [];

          if (_insertData) {
            const newRows = _insertData.map(row => ({
              id: row.id || `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
              created_at: new Date().toISOString(),
              ...row,
            }));
            if (!demoStore[tableName]) demoStore[tableName] = [];
            demoStore[tableName].push(...newRows);
            return resolve({ data: _isSingle ? newRows[0] : newRows, error: null, count: newRows.length });
          }

          if (_updateData) {
            let updated = null;
            if (demoStore[tableName]) {
              demoStore[tableName] = demoStore[tableName].map(row => {
                if (matchFilters(row, _filters)) {
                  updated = { ...row, ..._updateData };
                  return updated;
                }
                return row;
              });
            }
            return resolve({ data: updated, error: null });
          }

          let results = [...table].filter(row => matchFilters(row, _filters));

          if (_orderBy) {
            results.sort((a, b) => {
              const va = a[_orderBy]; const vb = b[_orderBy];
              if (va < vb) return _orderAsc ? -1 : 1;
              if (va > vb) return _orderAsc ? 1 : -1;
              return 0;
            });
          }
          if (_limitCount) results = results.slice(0, _limitCount);
          if (_isHead && _isCount) return resolve({ data: null, error: null, count: results.length });
          if (_isSingle) return resolve({ data: results[0] || null, error: null });
          return resolve({ data: results, error: null, count: results.length });
        } catch (err) {
          return resolve({ data: null, error: { message: err.message } });
        }
      },
    };
    return chain;
  }

  supabase = {
    from: (t) => createChainable(t),
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: { path: 'demo.jpg' }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
    _demoStore: demoStore,
    _isDemo: true,
  };
}

export { supabase, isDemo };
