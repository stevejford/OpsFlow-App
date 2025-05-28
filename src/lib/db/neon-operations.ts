import { query } from './neon-db';
import { Employee, License, Induction, Document, EmergencyContact, Folder, DocumentFile, CreateEmployee, UpdateEmployee } from './schema';

// Employee Operations
export const employeeOperations = {
  // Create a new employee
  async create(employee: CreateEmployee): Promise<Employee> {
    const { rows } = await query<Employee>(
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
    const { rows } = await query<Employee>('SELECT * FROM employees ORDER BY last_name, first_name');
    return rows;
  },

  // Get employee by ID
  async getById(id: string): Promise<Employee | null> {
    const { rows } = await query<Employee>('SELECT * FROM employees WHERE id = $1', [id]);
    return rows[0] || null;
  },

  // Update an employee
  async update(id: string, updates: Partial<UpdateEmployee>): Promise<Employee | null> {
    const keys = Object.keys(updates);
    if (keys.length === 0) return null;

    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = [...Object.values(updates), id];

    const { rows } = await query<Employee>(
      `UPDATE employees 
       SET ${setClause}, updated_at = NOW() 
       WHERE id = $${values.length} 
       RETURNING *`,
      values
    );

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
    const { rows } = await query<Employee>(
      `SELECT * FROM employees 
       WHERE first_name ILIKE $1 
          OR last_name ILIKE $1 
          OR email ILIKE $1 
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
    const { rows } = await query<License>(
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
    const { rows } = await query<License>(
      'SELECT * FROM licenses WHERE employee_id = $1 ORDER BY expiry_date DESC',
      [employeeId]
    );
    return rows;
  },

  // Get expiring licenses
  async getExpiring(days: number): Promise<License[]> {
    const { rows } = await query<License>(
      `SELECT l.*, e.first_name, e.last_name, e.email 
       FROM licenses l
       JOIN employees e ON l.employee_id = e.id
       WHERE l.expiry_date BETWEEN NOW() AND NOW() + ($1 * interval '1 day')
       ORDER BY l.expiry_date`,
      [days]
    );
    return rows;
  },

  // Update a license
  async update(id: string, updates: Partial<License>): Promise<License | null> {
    const keys = Object.keys(updates).filter(key => key !== 'id' && key !== 'employee_id');
    if (keys.length === 0) return null;

    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = [...keys.map(key => updates[key as keyof License]), id];

    const { rows } = await query<License>(
      `UPDATE licenses 
       SET ${setClause}, updated_at = NOW() 
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );

    return rows[0] || null;
  },

  // Delete a license
  async delete(id: string): Promise<boolean> {
    const { rowCount } = await query('DELETE FROM licenses WHERE id = $1', [id]);
    return rowCount > 0;
  }
};

// Induction Operations
export const inductionOperations = {
  // Create a new induction
  async create(induction: Omit<Induction, 'id' | 'created_at' | 'updated_at'>): Promise<Induction> {
    const { rows } = await query<Induction>(
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

  // Get inductions by employee ID
  async getByEmployeeId(employeeId: string): Promise<Induction[]> {
    const { rows } = await query<Induction>(
      'SELECT * FROM inductions WHERE employee_id = $1 ORDER BY completed_date DESC',
      [employeeId]
    );
    return rows;
  },

  // Get expiring inductions
  async getExpiring(days: number): Promise<Induction[]> {
    const { rows } = await query<Induction>(
      `SELECT i.*, e.first_name, e.last_name, e.email 
       FROM inductions i
       JOIN employees e ON i.employee_id = e.id
       WHERE i.expiry_date BETWEEN NOW() AND NOW() + ($1 * interval '1 day')
       ORDER BY i.expiry_date`,
      [days]
    );
    return rows;
  },

  // Update an induction
  async update(id: string, updates: Partial<Induction>): Promise<Induction | null> {
    const keys = Object.keys(updates).filter(key => key !== 'id' && key !== 'employee_id');
    if (keys.length === 0) return null;

    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = [...keys.map(key => updates[key as keyof Induction]), id];

    const { rows } = await query<Induction>(
      `UPDATE inductions 
       SET ${setClause}, updated_at = NOW() 
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );

    return rows[0] || null;
  },

  // Delete an induction
  async delete(id: string): Promise<boolean> {
    const { rowCount } = await query('DELETE FROM inductions WHERE id = $1', [id]);
    return rowCount > 0;
  }
};

// Document Operations
export const documentOperations = {
  // Create a new document
  async create(document: Omit<Document, 'id' | 'created_at' | 'updated_at' | 'upload_date'>): Promise<Document> {
    const { rows } = await query<Document>(
      `INSERT INTO documents 
       (employee_id, name, type, file_url, notes, upload_date)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [
        document.employee_id,
        document.name,
        document.type,
        document.file_url,
        document.notes
      ]
    );
    return rows[0];
  },

  // Get documents by employee ID
  async getByEmployeeId(employeeId: string): Promise<Document[]> {
    const { rows } = await query<Document>(
      'SELECT * FROM documents WHERE employee_id = $1 ORDER BY upload_date DESC',
      [employeeId]
    );
    return rows;
  },

  // Get documents by type
  async getByType(type: string): Promise<Document[]> {
    const { rows } = await query<Document>(
      'SELECT * FROM documents WHERE type = $1 ORDER BY upload_date DESC',
      [type]
    );
    return rows;
  },

  // Update a document
  async update(id: string, updates: Partial<Document>): Promise<Document | null> {
    const keys = Object.keys(updates).filter(key => key !== 'id' && key !== 'employee_id' && key !== 'file_url');
    if (keys.length === 0) return null;

    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = [...keys.map(key => updates[key as keyof Document]), id];

    const { rows } = await query<Document>(
      `UPDATE documents 
       SET ${setClause}, updated_at = NOW() 
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );

    return rows[0] || null;
  },

  // Delete a document
  async delete(id: string): Promise<boolean> {
    const { rowCount } = await query('DELETE FROM documents WHERE id = $1', [id]);
    return rowCount > 0;
  }
};

// Emergency Contact Operations
export const emergencyContactOperations = {
  // Create a new emergency contact
  async create(contact: Omit<EmergencyContact, 'id' | 'created_at' | 'updated_at'>): Promise<EmergencyContact> {
    const { rows } = await query<EmergencyContact>(
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
    const { rows } = await query<EmergencyContact>(
      'SELECT * FROM emergency_contacts WHERE employee_id = $1 ORDER BY is_primary DESC, name',
      [employeeId]
    );
    return rows;
  },

  // Get primary emergency contact for an employee
  async getPrimaryContact(employeeId: string): Promise<EmergencyContact | null> {
    const { rows } = await query<EmergencyContact>(
      'SELECT * FROM emergency_contacts WHERE employee_id = $1 AND is_primary = true LIMIT 1',
      [employeeId]
    );
    return rows[0] || null;
  },

  // Update an emergency contact
  async update(id: string, updates: Partial<EmergencyContact>): Promise<EmergencyContact | null> {
    // First, get the current contact to check if we're changing the primary status
    const currentContact = (await query<EmergencyContact>(
      'SELECT * FROM emergency_contacts WHERE id = $1',
      [id]
    )).rows[0];

    if (!currentContact) return null;

    const keys = Object.keys(updates).filter(key => key !== 'id' && key !== 'employee_id');
    if (keys.length === 0) return currentContact;

    // If setting a new primary contact, first unset any existing primary
    if (updates.is_primary === true) {
      await query(
        'UPDATE emergency_contacts SET is_primary = false, updated_at = NOW() WHERE employee_id = $1 AND id != $2',
        [currentContact.employee_id, id]
      );
    }
    // If unsetting primary, ensure at least one primary remains
    else if (updates.is_primary === false && currentContact.is_primary) {
      // Check if this is the only primary contact
      const otherPrimaries = (await query<{count: string}>(
        'SELECT COUNT(*) FROM emergency_contacts WHERE employee_id = $1 AND is_primary = true AND id != $2',
        [currentContact.employee_id, id]
      )).rows[0].count;

      if (otherPrimaries === '0') {
        throw new Error('Cannot unset primary contact. At least one primary contact is required.');
      }
    }

    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = [...keys.map(key => updates[key as keyof EmergencyContact]), id];

    const { rows } = await query<EmergencyContact>(
      `UPDATE emergency_contacts 
       SET ${setClause}, updated_at = NOW() 
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );

    return rows[0] || null;
  },

  // Delete an emergency contact
  async delete(id: string): Promise<boolean> {
    const { rowCount } = await query('DELETE FROM emergency_contacts WHERE id = $1', [id]);
    return rowCount > 0;
  }
};

// Folder operations
const folderOperations = {
  // Get all folders
  async getAll(): Promise<Folder[]> {
    const { rows } = await query<Folder>('SELECT * FROM folders ORDER BY name ASC');
    return rows;
  },

  // Get folder by ID
  async getById(id: string): Promise<Folder | null> {
    const { rows } = await query<Folder>('SELECT * FROM folders WHERE id = $1', [id]);
    return rows[0] || null;
  },

  // Create a new folder
  async create(folderData: Omit<Folder, 'id' | 'created_at' | 'updated_at'>): Promise<Folder> {
    const { rows } = await query<Folder>(
      `INSERT INTO folders (name, description, parent_id, path, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [folderData.name, folderData.description || '', folderData.parent_id, folderData.path]
    );
    return rows[0];
  },

  // Update a folder
  async update(id: string, updates: Partial<Omit<Folder, 'id' | 'created_at' | 'updated_at'>>): Promise<Folder | null> {
    const keys = Object.keys(updates);
    if (keys.length === 0) return null;

    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = [...Object.values(updates), id];

    const { rows } = await query<Folder>(
      `UPDATE folders 
       SET ${setClause}, updated_at = NOW() 
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );

    return rows[0] || null;
  },

  // Delete a folder
  async delete(id: string): Promise<boolean> {
    const { rowCount } = await query('DELETE FROM folders WHERE id = $1', [id]);
    return rowCount > 0;
  },

  // Get folders by parent ID
  async getByParentId(parentId: string | null): Promise<Folder[]> {
    const { rows } = await query<Folder>(
      'SELECT * FROM folders WHERE parent_id = $1 ORDER BY name ASC',
      [parentId]
    );
    return rows;
  }
};

// Document File Operations (for the document management system)
export const documentFileOperations = {
  // Create a new document file
  async create(document: Omit<DocumentFile, 'id' | 'created_at' | 'updated_at' | 'upload_date'>): Promise<DocumentFile> {
    const { rows } = await query<DocumentFile>(
      `INSERT INTO document_files 
       (folder_id, name, type, file_url, size, uploaded_by, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        document.folder_id,
        document.name,
        document.type,
        document.file_url,
        document.size,
        document.uploaded_by,
        document.notes
      ]
    );
    return rows[0];
  },

  // Get all documents in a folder
  async getByFolderId(folderId: string): Promise<DocumentFile[]> {
    const { rows } = await query<DocumentFile>(
      'SELECT * FROM document_files WHERE folder_id = $1 ORDER BY created_at DESC',
      [folderId]
    );
    return rows;
  },

  // Get all documents
  async getAll(): Promise<DocumentFile[]> {
    const { rows } = await query<DocumentFile>(
      'SELECT * FROM document_files ORDER BY created_at DESC'
    );
    return rows;
  },

  // Get document by ID
  async getById(id: string): Promise<DocumentFile | null> {
    const { rows } = await query<DocumentFile>('SELECT * FROM document_files WHERE id = $1', [id]);
    return rows[0] || null;
  },

  // Search documents
  async search(searchQuery: string, folderId?: string): Promise<DocumentFile[]> {
    let sql = `
      SELECT * FROM document_files 
      WHERE (name ILIKE $1 OR notes ILIKE $1)
    `;
    const params = [`%${searchQuery}%`];

    if (folderId) {
      sql += ' AND folder_id = $2';
      params.push(folderId);
    }

    sql += ' ORDER BY created_at DESC';

    const { rows } = await query<DocumentFile>(sql, params);
    return rows;
  },

  // Update a document file
  async update(id: string, updates: Partial<Omit<DocumentFile, 'id' | 'created_at' | 'updated_at' | 'upload_date'>>): Promise<DocumentFile | null> {
    const keys = Object.keys(updates);
    if (keys.length === 0) return null;

    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = [...Object.values(updates), id];

    const { rows } = await query<DocumentFile>(
      `UPDATE document_files 
       SET ${setClause}, updated_at = NOW() 
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );

    return rows[0] || null;
  },

  // Delete a document file
  async delete(id: string): Promise<boolean> {
    const { rowCount } = await query('DELETE FROM document_files WHERE id = $1', [id]);
    return rowCount > 0;
  },

  // Move document to another folder
  async move(id: string, newFolderId: string): Promise<DocumentFile | null> {
    const { rows } = await query<DocumentFile>(
      `UPDATE document_files 
       SET folder_id = $1, updated_at = NOW() 
       WHERE id = $2
       RETURNING *`,
      [newFolderId, id]
    );

    return rows[0] || null;
  },

  // Batch operations
  async batchDelete(ids: string[]): Promise<number> {
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
    const { rowCount } = await query(`DELETE FROM document_files WHERE id IN (${placeholders})`, ids);
    return rowCount;
  },

  async batchMove(ids: string[], newFolderId: string): Promise<number> {
    const placeholders = ids.map((_, i) => `$${i + 2}`).join(',');
    const { rowCount } = await query(
      `UPDATE document_files 
       SET folder_id = $1, updated_at = NOW() 
       WHERE id IN (${placeholders})`,
      [newFolderId, ...ids]
    );
    return rowCount;
  }
};

// Export all operations
export const db = {
  employees: employeeOperations,
  licenses: licenseOperations,
  inductions: inductionOperations,
  documents: documentOperations,
  emergencyContacts: emergencyContactOperations,
  folders: folderOperations,
  documentFiles: documentFileOperations,
  query,
  testConnection: async (): Promise<boolean> => {
    try {
      const { rows } = await query('SELECT NOW() as now');
      console.log('Database connection successful:', rows[0]);
      return true;
    } catch (error) {
      console.error('Database connection error:', error);
      return false;
    }
  }
};

export default db;
