import { query, pool } from './index';
import { Employee, License, Induction, Document, EmergencyContact, CreateEmployee, UpdateEmployee } from './schema';

// Employee Operations
export const employeeOperations = {
  // Create a new employee
  async create(employee: CreateEmployee): Promise<Employee> {
    const { rows } = await query(
      `INSERT INTO employees 
       (first_name, last_name, email, phone, position, department, status, hire_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        employee.first_name,
        employee.last_name,
        employee.email,
        employee.phone,
        employee.position,
        employee.department,
        employee.status,
        employee.hire_date
      ]
    );
    return rows[0];
  },

  // Get all employees
  async getAll(): Promise<Employee[]> {
    const { rows } = await query('SELECT * FROM employees ORDER BY last_name, first_name', []);
    return rows;
  },

  // Get employee by ID
  async getById(id: string): Promise<Employee | null> {
    const { rows } = await query('SELECT * FROM employees WHERE id = $1', [id]);
    return rows[0] || null;
  },

  // Update an employee
  async update(id: string, updates: UpdateEmployee): Promise<Employee | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    // Build the dynamic query based on provided fields
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const queryText = `
      UPDATE employees 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const { rows } = await query(queryText, values);
    return rows[0] || null;
  },

  // Delete an employee
  async delete(id: string): Promise<boolean> {
    const { rowCount } = await query('DELETE FROM employees WHERE id = $1', [id]);
    return rowCount > 0;
  },

  // Search employees by name or email
  async search(term: string): Promise<Employee[]> {
    const searchTerm = `%${term}%`;
    const { rows } = await query(
      `SELECT * FROM employees 
       WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1 
       ORDER BY last_name, first_name`,
      [searchTerm]
    );
    return rows;
  }
};

// License Operations
export const licenseOperations = {
  // Create a new license
  async create(license: Omit<License, 'id' | 'created_at' | 'updated_at'>): Promise<License> {
    const { rows } = await query(
      `INSERT INTO licenses 
       (employee_id, name, license_number, issue_date, expiry_date, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        license.employee_id,
        license.name,
        license.license_number,
        license.issue_date,
        license.expiry_date,
        license.status,
        license.notes
      ]
    );
    return rows[0];
  },

  // Get licenses by employee ID
  async getByEmployeeId(employeeId: string): Promise<License[]> {
    const { rows } = await query(
      'SELECT * FROM licenses WHERE employee_id = $1 ORDER BY expiry_date DESC',
      [employeeId]
    );
    return rows;
  },

  // Get expiring licenses
  async getExpiring(days: number): Promise<License[]> {
    const { rows } = await query(
      `SELECT l.*, e.first_name, e.last_name, e.email
       FROM licenses l
       JOIN employees e ON l.employee_id = e.id
       WHERE l.expiry_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + $1 * INTERVAL '1 day')
       ORDER BY l.expiry_date`,
      [days]
    );
    return rows;
  }
};

// Induction Operations
export const inductionOperations = {
  // Create a new induction
  async create(induction: Omit<Induction, 'id' | 'created_at' | 'updated_at'>): Promise<Induction> {
    const { rows } = await query(
      `INSERT INTO inductions 
       (employee_id, name, completed_date, expiry_date, status, provider, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        induction.employee_id,
        induction.name,
        induction.completed_date,
        induction.expiry_date,
        induction.status,
        induction.provider,
        induction.notes
      ]
    );
    return rows[0];
  },

  // Get all inductions with employee details
  async getAll(): Promise<any[]> {
    const { rows } = await query(
      `SELECT i.*, 
              e.first_name, 
              e.last_name, 
              e.position,
              d.file_url as document_url
       FROM inductions i
       LEFT JOIN employees e ON i.employee_id = e.id
       LEFT JOIN documents d ON d.employee_id = i.employee_id 
          AND d.name LIKE CONCAT('%', i.name, '%')
          AND d.type = 'certificate'
       ORDER BY i.updated_at DESC`,
      []
    );
    return rows;
  },

  // Get inductions by employee ID
  async getByEmployeeId(employeeId: string): Promise<Induction[]> {
    const { rows } = await query(
      'SELECT * FROM inductions WHERE employee_id = $1 ORDER BY completed_date DESC',
      [employeeId]
    );
    return rows;
  },

  // Get a single induction by ID
  async getById(id: string): Promise<Induction | null> {
    const { rows } = await query(
      'SELECT * FROM inductions WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  // Update an induction
  async update(id: string, updates: Partial<Omit<Induction, 'id' | 'created_at' | 'updated_at'>>): Promise<Induction | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    // Build the dynamic query based on provided fields
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      // No fields to update
      return this.getById(id);
    }

    values.push(id);
    const { rows } = await query(
      `UPDATE inductions SET ${fields.join(', ')}, updated_at = NOW() 
       WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return rows[0] || null;
  },

  // Delete an induction
  async delete(id: string): Promise<boolean> {
    const { rowCount } = await query('DELETE FROM inductions WHERE id = $1', [id]);
    return rowCount > 0;
  },

  // Get expiring inductions
  async getExpiring(days: number): Promise<any[]> {
    const { rows } = await query(
      `SELECT i.*, 
              e.first_name, 
              e.last_name, 
              e.position,
              (i.expiry_date - CURRENT_DATE) as days_remaining
       FROM inductions i
       JOIN employees e ON i.employee_id = e.id
       WHERE i.expiry_date IS NOT NULL
       AND i.expiry_date <= CURRENT_DATE + INTERVAL '${days} days'
       AND i.expiry_date >= CURRENT_DATE
       ORDER BY i.expiry_date ASC`,
      []
    );
    return rows;
  },

  // Get overdue inductions
  async getOverdue(): Promise<any[]> {
    const { rows } = await query(
      `SELECT i.*, 
              e.first_name, 
              e.last_name, 
              e.position,
              (CURRENT_DATE - i.expiry_date) as days_overdue
       FROM inductions i
       JOIN employees e ON i.employee_id = e.id
       WHERE i.expiry_date IS NOT NULL
       AND i.expiry_date < CURRENT_DATE
       AND i.status != 'Completed'
       ORDER BY i.expiry_date ASC`,
      []
    );
    return rows;
  }
};

// Document Operations
export const documentOperations = {
  // Upload a new document
  async create(document: Omit<Document, 'id' | 'created_at' | 'updated_at'>): Promise<Document> {
    const { rows } = await query(
      `INSERT INTO documents 
       (employee_id, name, type, file_url, upload_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        document.employee_id,
        document.name,
        document.type,
        document.file_url,
        document.upload_date,
        document.notes
      ]
    );
    return rows[0];
  },

  // Get documents by employee ID
  async getByEmployeeId(employeeId: string): Promise<Document[]> {
    const { rows } = await query(
      'SELECT * FROM documents WHERE employee_id = $1 ORDER BY upload_date DESC',
      [employeeId]
    );
    return rows;
  },

  // Delete a document
  async delete(id: string): Promise<boolean> {
    const { rowCount } = await query('DELETE FROM documents WHERE id = $1', [id]);
    return rowCount > 0;
  }
};

// Emergency Contact Operations
export const emergencyContactOperations = {
  // Add a new emergency contact
  async create(contact: Omit<EmergencyContact, 'id' | 'created_at' | 'updated_at'>): Promise<EmergencyContact> {
    // If this is set as primary, unset any existing primary for this employee
    if (contact.is_primary) {
      await query(
        'UPDATE emergency_contacts SET is_primary = false WHERE employee_id = $1',
        [contact.employee_id]
      );
    }

    const { rows } = await query(
      `INSERT INTO emergency_contacts 
       (employee_id, name, relationship, phone, email, address, is_primary)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        contact.employee_id,
        contact.name,
        contact.relationship,
        contact.phone,
        contact.email,
        contact.address,
        contact.is_primary
      ]
    );
    return rows[0];
  },

  // Get emergency contacts by employee ID
  async getByEmployeeId(employeeId: string): Promise<EmergencyContact[]> {
    const { rows } = await query(
      'SELECT * FROM emergency_contacts WHERE employee_id = $1 ORDER BY is_primary DESC, name',
      [employeeId]
    );
    return rows;
  },

    // Set a contact as primary
  async setAsPrimary(id: string, employeeId: string): Promise<EmergencyContact> {
    // Start a transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Unset any existing primary
      await client.query(
        'UPDATE emergency_contacts SET is_primary = false WHERE employee_id = $1',
        [employeeId]
      );
      
      // Set the new primary
      const { rows } = await client.query(
        'UPDATE emergency_contacts SET is_primary = true WHERE id = $1 RETURNING *',
        [id]
      );
      
      await client.query('COMMIT');
      return rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Delete an emergency contact
  async delete(id: string): Promise<boolean> {
    const { rowCount } = await query('DELETE FROM emergency_contacts WHERE id = $1', [id]);
    return rowCount > 0;
  }
};

// Export all operations
export const db = {
  employees: employeeOperations,
  licenses: licenseOperations,
  inductions: inductionOperations,
  documents: documentOperations,
  emergencyContacts: emergencyContactOperations
};

export default db;
