// DISABLED: Supabase client replaced with MSSQL
// This file is kept for compatibility but functionality is disabled

console.warn('⚠️  Supabase client disabled - using MSSQL database instead');

// Minimal chainable query builder mock to resemble Supabase client's fluent API
function createQueryBuilder(): any {
  const qb: any = {
    _table: null,
    _select: '*',
    _filters: [] as any[],
    _order: null as any,
    _limit: null as any,
    from(table?: string) {
      qb._table = table;
      return qb;
    },
    select(cols?: string) {
      qb._select = cols ?? '*';
      return qb;
    },
    insert(_payload?: any) {
      qb._op = 'insert';
      qb._payload = _payload;
      return qb;
    },
    update(_payload?: any) {
      qb._op = 'update';
      qb._payload = _payload;
      return qb;
    },
    delete() {
      qb._op = 'delete';
      return qb;
    },
    upsert(_payload?: any) {
      qb._op = 'upsert';
      qb._payload = _payload;
      return qb;
    },
    eq(_col: string, _val: any) {
      qb._filters.push({ type: 'eq', col: _col, val: _val });
      return qb;
    },
    order(col: string, opts?: any) {
      qb._order = { col, opts };
      return qb;
    },
    limit(n: number) {
      qb._limit = n;
      return qb;
    },
    single() {
      qb._single = true;
      return qb;
    },
    then(resolve: any) {
      // Resolve with a shape similar to Supabase responses
      const response = { data: [], error: null };
      return Promise.resolve(response).then(resolve);
    },
    catch(reject: any) {
      // allow catch chaining
      return Promise.resolve({ data: [], error: null }).catch(reject);
    },
  };

  return qb;
}

// Mock Supabase client to prevent initialization errors
export const supabase = {
  from: (table?: string) => createQueryBuilder().from(table),
  auth: {
    // Provide a minimal getSession compatible with newer supabase-js
    getSession: async () => ({ data: { session: null }, error: null }),
    // getUser remains available for older code
    getUser: async () => ({ data: { user: null }, error: null }),
    // onAuthStateChange: call the callback immediately and return a subscription-like object
    onAuthStateChange: (cb: any) => {
      const subscription = { unsubscribe: () => {} };
      // call callback with nulls to emulate signed-out state
      try { cb(null, null); } catch (e) { /**/ }
      return { data: { subscription } };
    },
    // signInWithPassword/signUp/signOut - accept parameters but return a compatible shape
    signInWithPassword: async (_creds?: any) => ({ data: { user: null }, error: null }),
    signUp: async (_creds?: any) => ({ data: { user: null }, error: null }),
    signOut: async () => ({ error: null }),
  },
  storage: {
    from: (_bucket?: string) => ({
      upload: async () => ({ data: null, error: null }),
      download: async () => ({ data: null, error: null }),
    }),
  },
};

// Database types for compatibility (no longer used)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: number
          email: string
          branch_id: number
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id?: number
          email: string
          branch_id: number
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: number
          email?: string
          branch_id?: number
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      branches: {
        Row: {
          branch_id: number
          branch_name: string
        }
        Insert: {
          branch_id?: number
          branch_name: string
        }
        Update: {
          branch_id?: number
          branch_name?: string
        }
      }
      medicine_stock_in: {
        Row: {
          medicine_stock_in_id: number
          medicine_id: number
          branch_id: number
          user_id: number
          quantity: number
          date_received: string
          expiration_date?: string
        }
        Insert: {
          medicine_stock_in_id?: number
          medicine_id: number
          branch_id: number
          user_id: number
          quantity: number
          date_received?: string
          expiration_date?: string
        }
        Update: {
          medicine_stock_in_id?: number
          medicine_id?: number
          branch_id?: number
          user_id?: number
          quantity?: number
          date_received?: string
          expiration_date?: string
        }
      }
      medicine_stock_out: {
        Row: {
          medicine_stock_out_id: number
          medicine_stock_in_id: number
          quantity_dispensed: number
          user_id: number
          timestamp_dispensed: string
          branch_id: number
        }
        Insert: {
          medicine_stock_out_id?: number
          medicine_stock_in_id: number
          quantity_dispensed: number
          user_id: number
          timestamp_dispensed?: string
          branch_id: number
        }
        Update: {
          medicine_stock_out_id?: number
          medicine_stock_in_id?: number
          quantity_dispensed?: number
          user_id?: number
          timestamp_dispensed?: string
          branch_id?: number
        }
      }
      medicine_deleted: {
        Row: {
          medicine_deleted_id: number
          medicine_stock_in_id: number
          quantity: number
          description: string | null
          deleted_at: string
        }
        Insert: {
          medicine_deleted_id?: number
          medicine_stock_in_id: number
          quantity: number
          description?: string | null
          deleted_at?: string
        }
        Update: {
          medicine_deleted_id?: number
          medicine_stock_in_id?: number
          quantity?: number
          description?: string | null
          deleted_at?: string
        }
      }
    }
  }
}
