import db from '@/lib/db/index';
export interface Task {
  id: string;
  employee_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'review' | 'completed';
  due_date?: Date;
  created_at: Date;
  updated_at: Date;
  employee?: {
    first_name: string;
    last_name: string;
  };
}

export async function getTasks(): Promise<Task[]> {
  try {
    const { rows } = await db.query(`
      SELECT 
        t.*,
        e.first_name,
        e.last_name
      FROM tasks t
      LEFT JOIN employees e ON t.employee_id = e.id
      ORDER BY t.created_at DESC
    `);

    return rows.map(row => ({
      ...row,
      due_date: row.due_date ? new Date(row.due_date) : undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      employee: row.first_name ? {
        first_name: row.first_name,
        last_name: row.last_name
      } : undefined
    }));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw new Error('Failed to fetch tasks');
  }
}

export async function getTaskById(id: string): Promise<Task | null> {
  try {
    const { rows } = await db.query(`
      SELECT 
        t.*,
        e.first_name,
        e.last_name
      FROM tasks t
      LEFT JOIN employees e ON t.employee_id = e.id
      WHERE t.id = $1
    `, [id]);

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      ...row,
      due_date: row.due_date ? new Date(row.due_date) : undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      employee: row.first_name ? {
        first_name: row.first_name,
        last_name: row.last_name
      } : undefined
    };
  } catch (error) {
    console.error('Error fetching task:', error);
    throw new Error('Failed to fetch task');
  }
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  try {
    const { rows } = await db.query(`
      INSERT INTO tasks (employee_id, title, description, status, due_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [task.employee_id, task.title, task.description, task.status, task.due_date]);

    const newTask = rows[0];
    return {
      ...newTask,
      due_date: newTask.due_date ? new Date(newTask.due_date) : undefined,
      created_at: new Date(newTask.created_at),
      updated_at: new Date(newTask.updated_at)
    };
  } catch (error) {
    console.error('Error creating task:', error);
    throw new Error('Failed to create task');
  }
}

export async function updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>): Promise<Task> {
  try {
    const setClause = [];
    const values = [];
    let paramCount = 1;

    if (updates.title !== undefined) {
      setClause.push(`title = $${paramCount++}`);
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      setClause.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }
    if (updates.status !== undefined) {
      setClause.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }
    if (updates.due_date !== undefined) {
      setClause.push(`due_date = $${paramCount++}`);
      values.push(updates.due_date);
    }
    if (updates.employee_id !== undefined) {
      setClause.push(`employee_id = $${paramCount++}`);
      values.push(updates.employee_id);
    }

    setClause.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await db.query(`
      UPDATE tasks 
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (rows.length === 0) {
      throw new Error('Task not found');
    }

    const updatedTask = rows[0];
    return {
      ...updatedTask,
      due_date: updatedTask.due_date ? new Date(updatedTask.due_date) : undefined,
      created_at: new Date(updatedTask.created_at),
      updated_at: new Date(updatedTask.updated_at)
    };
  } catch (error) {
    console.error('Error updating task:', error);
    throw new Error('Failed to update task');
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    const { rowCount } = await db.query('DELETE FROM tasks WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      throw new Error('Task not found');
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    throw new Error('Failed to delete task');
  }
}
